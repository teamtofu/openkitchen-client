import Store from './Store';

export default (id) => {
    let recipe = Store.get('recipes')[id];
    let ing = recipe.recipeIngredient || [];
    let list = Store.get('list') || {};

    for (let i in ing) {
        let item = {
            name: ing[i],
            createdAt: new Date().getTime(),
            id: Math.random().toString(36).split('.')[1],
            checked: false,
            recipe: id
        };
        list[item.id] = item;
    }

    Store.set('list', list);
};