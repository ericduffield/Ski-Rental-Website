const model = require('../models/skiEquipmentModelMysql');
const dbName = "skiEquipment_db_test";
const home = "http://localhost:1339/home";
const list = "http://localhost:1339/listSkiEquipment";
const get = "http://localhost:1339/get";
const edit = "http://localhost:1339/edit";
const deleteUrl = "http://localhost:1339/delete";


beforeEach(async () => {
    await model.initialize(dbName, true);
    // load home page and wait until it is fully loaded
    await page.goto(home, { waitUntil: "domcontentloaded" });
})


afterEach(async () => {
    connection = model.getConnection();
    if (connection) {
        await connection.close();
    }
    //await page.close();
});


/* Data to be used to generate random skiEquipment for testing */
const skiEquipment = [
    { name: 'Skis', price: '80.99', image: 'https://i1.adis.ws/i/lineskis/line_2122_SAKANA_1?w=412&fmt=webp&fmt.interlaced=true&bg=white&dpi=96' },
    { name: 'Snowboard', price: '100.99', image: 'https://static2.jonessnowboards.com/1214-medium_default/frontier.jpg' },
    { name: 'Helmet', price: '40.99', image: 'https://www.burton.com/static/product/W22/21523100001_1.png' },
    { name: 'Poles', price: '30.99', image: 'https://i1.adis.ws/i/k2/k2_2122_POWER_ALUMINUM_2?w=480&fmt=webp&fmt.interlaced=true&bg=white&protocol=https' },
    { name: 'Hat', price: '15.99', image: 'https://m.media-amazon.com/images/I/81ywGFOb0eL._AC_UL1500_.jpg' },
    { name: 'Gloves', price: '15.99', image: 'https://columbia.scene7.com/is/image/ColumbiaSportswear2/1860091_010_f?wid=768&hei=806&v=1642418206' },
    { name: 'Boots', price: '20.99', image: 'https://images.evo.com/imgp/zoom/163305/645036/salomon-s-pro-100-ski-boots-2021-.jpg' },
]

/**
 * Generates a random ski equipment for testing
 * @returns returns object with name, price, and image
 */
const generateSkiEquipment = () => {
    const index = Math.floor((Math.random() * skiEquipment.length));
    return skiEquipment.slice(index, index + 1)[0];
}


//==================SUCCESS CASE TESTS====================

test("Add Ski Equipment UI test success", async () => {
    // wait for 1 second for first test because sometimes it starts typing before the page is fully loaded
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#price', price);
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Extract all the text content on the page 
    const text = await page.evaluate(() => document.body.textContent);
    const textLower = text.toLowerCase();

    // Verify successful outcome 
    expect(textLower).toContain('successfully');
    expect(textLower).toContain(name.toLowerCase());
    expect(textLower).toContain(price.toLowerCase());

    await new Promise(resolve => setTimeout(resolve, 100));
});


test("List Ski Equipment UI test success", async () => {
    //Loops 3 times to generate 3 ski equipments and add them to the database
    for (let i = 0; i < 3; i++) {
        //goes to home page
        await page.goto(home, { waitUntil: "domcontentloaded" });

        // Generates random ski equipment
        const { name, price, image } = generateSkiEquipment();

        //Types information into the form
        await page.type('#name', name);
        await page.type('#price', price);
        await page.type('#image', image);

        await page.evaluate(() => {
            document.querySelector('.btn').click();
        });

        //wait extra because sometimes page doesn't load fast enough
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    //goes to list form page
    await page.goto(list, { waitUntil: "domcontentloaded" });


    // Gets page content and checks if there are 3 elements with id "poke"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".poke");
    expect(elements.length).toBe(3);

    await new Promise(resolve => setTimeout(resolve, 100));
});


test("Get Ski Equipment UI test success", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#price', price);
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    //goes to get form page
    await page.goto(get, { waitUntil: "domcontentloaded" });

    //Types information into the form
    await page.type('#name', name);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Extract all the text content on the page 
    const text = await page.evaluate(() => document.body.textContent);
    const textLower = text.toLowerCase();

    // Verify successful outcome 
    expect(textLower).toContain('successfully');
    expect(textLower).toContain(name.toLowerCase());
    expect(textLower).toContain(price.toLowerCase());

    await new Promise(resolve => setTimeout(resolve, 100));
});


test("Edit Ski Equipment UI test success", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#price', price);
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    //goes to edit form page
    await page.goto(edit, { waitUntil: "domcontentloaded" });

    const { name: newName, price: newPrice, image: newImage } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#newName', newName);
    await page.type('#newPrice', newPrice);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));


    // Extract all the text content on the page 
    const text = await page.evaluate(() => document.body.textContent);
    const textLower = text.toLowerCase();

    // Verify successful outcome 
    expect(textLower).toContain('successfully');
    expect(textLower).toContain(newName.toLowerCase());
    expect(textLower).toContain(newPrice.toLowerCase());

    await new Promise(resolve => setTimeout(resolve, 100));
});


test("Delete Ski Equipment UI test success", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#price', price);
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    //goes to delete form page
    await page.goto(deleteUrl, { waitUntil: "domcontentloaded" });

    //Types information into the form
    await page.type('#name', name);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Extract all the text content on the page 
    const text = await page.evaluate(() => document.body.textContent);
    const textLower = text.toLowerCase();

    // Verify successful outcome 
    expect(textLower).toContain('successfully');

    await new Promise(resolve => setTimeout(resolve, 100));
});



//==================INPUT VALIDATION FAILURE TESTS====================

test("Add Ski Equipment UI Empty name", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', " ");
    await page.type('#price', price);
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});

test("Add Ski Equipment UI Number in name", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', "123");
    await page.type('#price', price);
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});

test("Add Ski Equipment UI Empty price", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#price', " ");
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});

test("Add Ski Equipment UI character price", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#price', "a");
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});


test("Add Ski Equipment UI 0 Price", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#price', "0");
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});

test("Add Ski Equipment UI Negative Price", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#price', "-1");
    await page.type('#image', image);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});


test("Get Ski Equipment UI Empty Name", async () => {
    //goes to get form page
    await page.goto(get, { waitUntil: "domcontentloaded" });

    //Types information into the form
    await page.type('#name', " ");

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});


test("Edit Ski Equipment UI Invalid Name", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //goes to edit form page
    await page.goto(edit, { waitUntil: "domcontentloaded" });

    const { name: newName, price: newPrice, image: newImage } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#newName', " ");
    await page.type('#newPrice', newPrice);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});

test("Edit Ski Equipment UI Invalid Price", async () => {
    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //goes to edit form page
    await page.goto(edit, { waitUntil: "domcontentloaded" });

    const { name: newName, price: newPrice, image: newImage } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#newName', newName);
    await page.type('#newPrice', "hello");

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});

test("Delete Ski Equipment UI Empty Name", async () => {
    //goes to delete form page
    await page.goto(deleteUrl, { waitUntil: "domcontentloaded" });

    //Types information into the form
    await page.type('#name', " ");

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});



//==================DATABASE FAILURE TESTS====================

test("Get Ski Equipment UI failure case", async () => {
    //goes to get form page
    await page.goto(get, { waitUntil: "domcontentloaded" });

    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});

test("Edit Ski Equipment UI failure case", async () => {
    //goes to edit form page
    await page.goto(edit, { waitUntil: "domcontentloaded" });

    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();
    const { name: newName, price: newPrice, image: newImage } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);
    await page.type('#newName', newName);
    await page.type('#newPrice', newPrice);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});


test("Delete Ski Equipment UI failure case", async () => {
    //goes to delete form page
    await page.goto(deleteUrl, { waitUntil: "domcontentloaded" });

    // Generates random ski equipment
    const { name, price, image } = generateSkiEquipment();

    //Types information into the form
    await page.type('#name', name);

    await page.evaluate(() => {
        document.querySelector('.btn').click();
    });

    //wait extra because sometimes page doesn't load fast enough
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gets page content and checks if there is an element with class "alert-primary"
    const pageFrame = page.mainFrame();
    const elements = await pageFrame.$$(".alert-primary");
    expect(elements.length).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));
});