import React from 'react';
import Store from '../shared/Store';
import Calendar from 'react-calendar';
import Fuse from 'fuse.js';
import ImportIng from '../shared/ImportIng';
import Classy from '../shared/Classy';

const cx = Classy([]);

class MealPlan extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            plan: Store.get('plan') || {},
            date: new Date(),
            search: '',
            recipe: '',
            recipes: Store.get('recipes') || {},
            su: false,
            mo: false,
            tu: false,
            we: false,
            th: false,
            fr: false,
            sa: false
        };

        const options = {
            shouldSort: true,
            threshold: 0.6,
            //location: 0,
            distance: 100,
            maxPatternLength: 20,
            minMatchCharLength: 1,
            keys: [
                {
                    name: 'name',
                    weight: 0.7
                },
                {
                    name: 'description',
                    weight: 0.3
                },
            ]
        };
        this.fuse = new Fuse(Object.values(this.state.recipes), options);

        window.scrollTo(0, 0);
    }

    search = (term) => {
        return this.fuse.search(term.substr(0, 20));
    }

    setRecipe = (id) => {
        this.setState({
            recipe: id,
            search: ''
        });
    };

    addRecipe = (days) => {
        const { recipe } = this.state;

        if (recipe) {
            let plan = Store.get('plan') || {};
            for (let i in days) {
                if (this.state[days[i].dayId] && days[i].rel !== -1) {
                    plan[days[i].pkey] = {
                        id: days[i].pkey,
                        recipes: (plan[days[i].pkey] ? plan[days[i].pkey].recipes : []).concat([recipe])
                    };
                }
            }
            Store.set('plan', plan);
            this.setState({
                plan,
                search: '',
                recipe: '',
                su: false,
                mo: false,
                tu: false,
                we: false,
                th: false,
                fr: false,
                sa: false
            });
        }
    };

    removeRecipe = (pkey, recipeId) => {
        let plan = Store.get('plan');
        plan[pkey].recipes.splice(plan[pkey].recipes.indexOf(recipeId), 1);
        Store.set('plan', plan);
        this.setState({plan});
    };

    mergeRecipeIng = (days) => {
        let allRecipes = [];
        for (let i in days) {
            let recipes  = (this.state.plan[days[i].pkey] || {}).recipes || [];
            for (let o in recipes) {
                if (allRecipes.indexOf(recipes[o]) === -1) allRecipes.push(recipes[o]);
            }
        }
        for (let i in allRecipes) {
            ImportIng(allRecipes[i]);
        }
        this.props.history.push('/grocery-list');
    };

    replaceRecipeIng = (days) => {
        Store.remove('list');
        this.mergeRecipeIng(days);
    };

    render() {
        let { plan, date, search, recipe, recipes } = this.state;

        const today = new Date();

        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());

        let searchResults = [];
        if (search) searchResults = this.search(search);

        const days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ].map((day, i) => {
            const inter = new Date(start);
            inter.setDate(inter.getDate() + i);
            return {
                name: day,
                abbr: day.substr(0, 2),
                dayId: day.substr(0, 2).toLowerCase(),
                rel: today.toDateString() === inter.toDateString() ? 0 : today > inter ? -1 : 1,
                two: `${inter.getMonth() + 1}/${inter.getDate()}`,
                pkey: `${inter.getMonth() + 1}-${inter.getDate()}-${inter.getFullYear()}`
            };
        });

        return (<div className={cx('container')}>
            <h1 className={cx('pt-3', 'pb-2')}>My Meal Plan</h1>
            <div className={cx('row')}>
                <div className={cx('col-12', 'col-lg-5')}>
                    <div className={cx('d-block')}>
                        <Calendar className={cx('mx-auto')} onChange={(date) => this.setState({date})} value={date} calendarType='US' minDetail='month' minDate={new Date()}/>
                    </div>
                </div>
                <div className={cx('col-12', 'col-lg-7')}>
                    <div className={cx('my-3', 'mt-lg-0')}>
                        <h3>Week {days[0].two}-{days[6].two}</h3>
                        <hr />
                        <div className={cx('pb-4')}>
                            <label htmlFor='select-recipe'>Select a Recipe</label>
                            <select id='select-recipe' className={cx('form-control', 'mb-3')} value={recipe} onChange={(ev) => this.setRecipe(ev.target.value)}>
                                <option>Select a Recipe</option>
                                {Object.values(recipes).map((recipe, key) => (<option key={key} value={recipe.id}>{recipe.name}</option>))}
                            </select>

                            <label htmlFor='search-recipe'>Search Recipes</label>
                            <input id='search-recipe' type='text' className={cx('form-control', 'mb-3')} value={search} onChange={(ev) => this.setState({search: ev.target.value})} placeholder='Search Recipes'/>

                            {searchResults[0] && (<ul className={cx('list-group', 'my-3')}>
                                {searchResults.slice(0, 3).map((recipe, key) => (<li key={key} className={cx('list-group-item')} onClick={() => this.setRecipe(recipe.id)}>
                                    {recipe.name}
                                </li>))}
                            </ul>)}

                            <label htmlFor='day-list'>Days to Add</label>
                            <div className={cx('btn-group', 'btn-block')} id='day-list'>
                                {days.map(({abbr, dayId, rel}, key) => (<div className={cx('btn', 'px-1', {'btn-secondary': rel === -1, 'btn-success': this.state[dayId] && rel !== -1, 'btn-danger': !this.state[dayId] && rel !== -1})} key={key} onClick={() => this.setState({[dayId]: !this.state[dayId]})}>{abbr}</div>))}
                            </div>
                            <div className={cx('btn', 'btn-dark', 'btn-block', 'my-2')} onClick={() => this.setState({
                                su: false,
                                mo: true,
                                tu: true,
                                we: true,
                                th: true,
                                fr: true,
                                sa: false
                            })}>Select All Weekdays</div>

                            <div className={cx('btn', 'btn-info', 'btn-block', 'my-3')} onClick={() => this.addRecipe(days)}>Add Recipe</div>
                        </div>
                        <div>
                            {days.map(({name, two, pkey, rel}, key) => {
                                let dayPlan = plan[pkey] || {};
                                return <div key={key} className={cx('my-2')}>
                                    <h4 className={cx({'font-weight-bold': rel === 0, 'text-muted': rel === -1})}>
                                        {name} ({two})
                                    </h4>
                                    {rel !== -1
                                        ? (<div>
                                            {!(dayPlan.recipes || [])[0] && (<div className={cx('alert', 'alert-light', 'border-secondary')}><b>No recipes yet!</b> Add them above.</div>)}
                                            {(dayPlan.recipes || []).map((id, key) => {
                                                let recipe = recipes[id];
                                                return (<div key={key} className={cx('input-group', 'rounded-0')}>
                                                    <div className={cx('form-control', 'h-auto', 'rounded-0')}>{recipe.name}</div>
                                                    <div className={cx('input-group-append')}>
                                                        <div className={cx('btn', 'btn-danger', 'rounded-0')} onClick={() => this.removeRecipe(pkey, id)}>Remove</div>
                                                    </div>
                                                </div>);
                                            })}
                                        </div>)
                                        : null}
                                </div>
                            })}
                            <div className={cx('btn-group', 'btn-block', 'my-3')}>
                                <div className={cx('btn', 'btn-light')} onClick={() => this.mergeRecipeIng(days)}>Merge To Groceries</div>
                                <div className={cx('btn', 'btn-dark')} onClick={() => this.replaceRecipeIng(days)}>Replace Groceries</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
    };
}

export default MealPlan;
