const Page = require('./helpers/page');

let page;

beforeEach(async ()=>{
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async ()=>{
    await page.close();
});

describe('While not logged in', async ()=>{
    const actions: [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 't',
                content: 'p',
            }
        },

    ]
    test('can not create posts by making a post request', async ()=>{
        const result = await page.post('/api/blogs', {title: 'Title', content: '123'})
        expect(result).toEqual({ error: 'You must log in!' });
    });

    test('can not retrieve any posts by making a get request', async ()=>{
        const result = await page.get('/api/blogs');
        expect(result).toEqual({ error: 'You must log in!' });
    });
});

describe('While logged in', async ()=>{
    beforeEach(async ()=>{
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see blog creation form', async ()=>{
        const label = await page.getContentsOf('form label')
        expect(label).toEqual('Blog Title');
    });
    describe('And using invalid inputs', async ()=>{
        beforeEach(async ()=>{
            await page.click('form button');
        });

        test('the form shows an error message', async ()=>{
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
    describe('And using valid inputs', async () => {
        beforeEach(async ()=>{
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');

        });
        test('Submitting takes user to review screen', async ()=>{
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('Submitting then saving adds blog to index page', async ()=>{
            await page.click('button.green');
            await page.waitFor('.card');
            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
        });

    });
});
