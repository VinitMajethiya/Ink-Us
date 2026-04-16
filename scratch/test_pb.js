import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function test() {
    try {
        console.log("Checking if 'milestones' collection exists...");
        const collections = await pb.collections.getList(1, 1, {
            filter: 'name = "milestones"'
        });
        
        if (collections.items.length === 0) {
            console.error("Error: 'milestones' collection does not exist.");
            return;
        }
        
        console.log("Collection found. Attempting to create a test record...");
        const data = {
            title: "Test Pin",
            date: "Today",
            text: "Testing connectivity",
            perspective: "his",
            layout: 'slambook',
            pageData: { title: "Test", content: '', photos: [] },
            stickyNotes: [],
            createdAt: new Date().toISOString()
        };
        
        const record = await pb.collection('milestones').create(data);
        console.log("Success! Created record ID:", record.id);
        
    } catch (e) {
        console.error("PocketBase Test Failed:");
        console.error("Message:", e.message);
        console.error("Status:", e.status);
        console.error("Data:", JSON.stringify(e.data, null, 2));
    }
}

test();
