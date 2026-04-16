import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─────────────────────────────────────────────────────────────────
// Firebase-compatible API Shims
// ─────────────────────────────────────────────────────────────────

/** Mimic: collection(db, 'collectionName') → just returns the name */
export const collection = (_db, name) => name

/** Mimic: addDoc(collection(db, 'milestones'), data) */
export const addDoc = async (tableName, data) => {
  const { data: record, error } = await supabase
    .from(tableName)
    .insert([data])
    .select()
    .single()
  
  if (error) throw error
  return { id: record.id }
}

/** Mimic: doc(db, 'milestones', id) → returns { tableName, id } */
export const doc = (_db, tableName, id) => ({ tableName, id })

/** Mimic: updateDoc(docRef, data) */
export const updateDoc = async (docRef, data) => {
  // Handle dot-notation paths (e.g. "pageData.content")
  const normalized = expandDotNotation(data)
  
  const { error } = await supabase
    .from(docRef.tableName)
    .update(normalized)
    .eq('id', docRef.id)

  if (error) throw error
}

/** Mimic: deleteDoc(doc(db, 'milestones', id)) */
export const deleteDoc = async (docRef) => {
  const { error } = await supabase
    .from(docRef.tableName)
    .delete()
    .eq('id', docRef.id)

  if (error) throw error
}

/** Mimic: query(collection(db, 'x'), orderBy('field', 'asc')) */
export const query = (tableName, ...constraints) => {
  let sortField = 'created_at'
  let sortDirection = 'asc'
  
  for (const c of constraints) {
    if (c.__type === 'orderBy') {
      sortField = c.field
      sortDirection = c.direction
    }
  }
  
  return { tableName, sortField, sortDirection }
}

/** Mimic: orderBy('field', 'asc'|'desc') */
export const orderBy = (field, direction = 'asc') => ({
  __type: 'orderBy',
  field,
  direction,
})

/**
 * Mimic: onSnapshot(query | docRef, callback)
 */
export const onSnapshot = (queryOrDoc, callback) => {
  const isDoc = queryOrDoc.id && (queryOrDoc.tableName || queryOrDoc.collectionName)

  if (isDoc) {
    const tableName = queryOrDoc.tableName || queryOrDoc.collectionName
    const id = queryOrDoc.id
    _subscribeOne(tableName, id, callback)
    const channel = supabase
      .channel(`doc-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName, filter: `id=eq.${id}` }, (payload) => {
        callback(_toDocSnapshot(payload.new))
      })
      .subscribe()
    
    return () => supabase.removeChannel(channel)
  }

  // Handle both query() result and raw PocketBase-style objects
  const tableName = queryOrDoc.tableName || queryOrDoc.collectionName
  let sortField = queryOrDoc.sortField || queryOrDoc.sort || 'created_at'
  let sortDirection = queryOrDoc.sortDirection || (sortField.startsWith('-') ? 'desc' : 'asc')
  
  // Clean up sort field
  if (sortField.startsWith('-')) sortField = sortField.substring(1)
  if (sortField === 'created') sortField = 'created_at'

  _subscribeAll(tableName, sortField, sortDirection, callback)
  
  const channel = supabase
    .channel(`table-${tableName}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, async () => {
        const { data } = await supabase
          .from(tableName)
          .select('*')
          .order(sortField, { ascending: sortDirection === 'asc' })
        callback(_toQuerySnapshot(data || []))
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ─── Internal helpers ─────────────────────────────────────────────

async function _subscribeAll(tableName, sortField, sortDirection, callback) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order(sortField, { ascending: sortDirection === 'asc' })
  
  if (error) {
    if (sortField === 'created_at') {
      // Fallback for older tables if needed, but here we mapped it
    }
    console.warn('[Supabase] Initial fetch failed:', error.message)
    callback(_toQuerySnapshot([]))
  } else {
    callback(_toQuerySnapshot(data))
  }
}

async function _subscribeOne(tableName, id, callback) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.warn('[Supabase] Initial doc fetch failed:', error.message)
    callback(_toDocSnapshot(null))
  } else {
    callback(_toDocSnapshot(data))
  }
}

function _toQuerySnapshot(records) {
  return {
    forEach: (fn) => records.forEach((r) => fn({ id: r.id, data: () => _stripMeta(r) })),
    docs: records.map(r => ({ id: r.id, data: () => _stripMeta(r) }))
  }
}

function _toDocSnapshot(record) {
  if (!record) return { data: () => null, exists: () => false }
  return {
    data: () => _stripMeta(record),
    exists: () => true,
    id: record.id,
  }
}

function _stripMeta(record) {
  if (!record) return {}
  const { id, created_at, ...rest } = record
  return {
    ...rest,
    created: created_at, // Map for compatibility with code expecting PocketBase 'created'
    created_at: created_at
  }
}

function expandDotNotation(data) {
  const result = {}
  for (const [key, value] of Object.entries(data)) {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      if (!result[parent]) result[parent] = {}
      result[parent][child] = value
    } else {
      result[key] = value
    }
  }
  return result
}

export const db = {}
export const arrayUnion = (value) => ({ __arrayUnion: true, value })

// ─────────────────────────────────────────────────────────────────
// PocketBase Compatibility (pb)
// ─────────────────────────────────────────────────────────────────
export const pb = {
  collection: (tableName) => ({
    getFullList: async (options = {}) => {
      let query = supabase.from(tableName).select('*')
      if (options.sort) {
        const isDesc = options.sort.startsWith('-')
        let field = isDesc ? options.sort.substring(1) : options.sort
        if (field === 'created') field = 'created_at'
        query = query.order(field, { ascending: !isDesc })
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    getOne: async (id) => {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    create: async (data) => {
      const { data: record, error } = await supabase.from(tableName).insert([data]).select().single()
      if (error) throw error
      return record
    },
    update: async (id, data) => {
      const { data: record, error } = await supabase.from(tableName).update(data).eq('id', id).select().single()
      if (error) throw error
      return record
    },
    delete: async (id) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id)
      if (error) throw error
    },
    subscribe: (id, callback) => {
      const channelId = `pb-sub-${tableName}-${id}`
      const channel = supabase
        .channel(channelId)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: tableName, 
          filter: id === '*' ? undefined : `id=eq.${id}` 
        }, (payload) => {
          callback({ record: payload.new, action: payload.eventType.toLowerCase() })
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    },
    unsubscribe: (id) => {
      // Handled by the return function of subscribe in our components
    }
  })
}
