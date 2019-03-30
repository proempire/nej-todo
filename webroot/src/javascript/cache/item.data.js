const item_list = [
    {
        name: 'Alice'
    },
    {
        name: 'Bob'
    }
];
window['item-list'] = {};
for (let i = 0; i < 10; i++) {
    window['item-list'][i] = item_list.slice(i, item_list.length);
}