import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Radio from "@material-ui/core/Radio/Radio";
import React, {useState} from "react";
import {faAngleDown, faAngleRight, faEllipsisH} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";
import {getTargetValue} from "../../utils/utils";
import {makeStyles} from "@material-ui/core/styles";

// Time, in days, from now for which to search the request list on the @dateFilterField
export const DF_WEEK = "7";
export const DF_MONTH = "30";
export const DF_YEAR = "365";
export const DF_ALL = "5000";
export const RECIPE_ALL = "ALL";

const useStyles = makeStyles({
    'root': {
        'display': 'inline-block'
    }
});

const mapFilter = {
    [DF_WEEK]: "Week",
    [DF_MONTH]: "Month",
    [DF_YEAR]: "Year (Pending Only)",
    [DF_ALL]: "All (Pending Only)"
};
export const mapDateFilter = (df) => {
    return mapFilter[df] || 'INVALID';
};

/**
 * Renders a date-selector field
 * @param formLabel
 * @param dateFilter
 * @param handleDateFilterToggle
 * @param initialDateFilter
 * @param projectState
 * @returns {*}
 * @constructor
 */
export const renderDateFilter = (formLabel, dateFilter, handleDateFilterToggle, initialDateFilter) => {
    return <FormControl component="fieldset" color="secondary">
        <FormLabel color="primary" component="legend">{formLabel}</FormLabel>
        <RadioGroup color="secondary" value={dateFilter}
                    onChange={handleDateFilterToggle}
                    defaultValue={initialDateFilter}
                    row
                    name="dateFilter"
                    aria-label="date-filter">
            {
                [DF_WEEK, DF_MONTH, DF_YEAR, DF_ALL].map((df) => {
                    return <FormControlLabel value={df}
                                      color={"secondary"}
                                      control={<Radio color={"secondary"}/>}
                                      label={<FormLabel color={"secondary"}>{mapDateFilter(df)}</FormLabel>}/>
                })
            }
        </RadioGroup>
    </FormControl>
};



/**
 * Displays view of recipes that can be filtered
 *
 * @param recipeSet
 */
export function RecipeFilter({recipeSet, setFilteredRecipes, filteredRecipes}) {
    const [showRecipesFilter, setShowRecipesFilter] = useState(false);

    const classes = useStyles();

    const updateFilteredRecipe = (evt) => {
        const target = getTargetValue(evt);
        if(filteredRecipes.has(target)){
            filteredRecipes.delete(target);
        } else {
            filteredRecipes.add(target);
        }
        setFilteredRecipes(new Set(filteredRecipes));
    };

    const updateAll = (evt) => {
        const target = getTargetValue(evt);
        if(target === RECIPE_ALL) {
            setFilteredRecipes(new Set());
        }
    };


    const recipes = Array.from(recipeSet).sort();
    return <div>
        <div onClick={() => setShowRecipesFilter(!showRecipesFilter)}
             className={"hover"}>
            <p className={"inline-block mskcc-white"}>Recipe Filter</p>
            <FontAwesomeIcon icon={ showRecipesFilter ? faAngleDown : faAngleRight }
                             className={"margin-left-10 inline-block mskcc-white"}/>
        </div>
        { showRecipesFilter ? <div>
            <FormGroup color="secondary"
                       name="dateFilter"
                       aria-label="date-filter"
                       className={classes.root}>
                <FormControlLabel value={RECIPE_ALL}
                                  color={"secondary"}
                                  control={<Checkbox color={"secondary"}
                                                     checked={filteredRecipes.size === 0}
                                                     onChange={updateAll}
                                                     name={RECIPE_ALL}/>}
                                  label={<FormLabel color={"secondary"}>{RECIPE_ALL}</FormLabel>}/>
            </FormGroup>
            {
                recipes.map((recipe) => {
                    return <FormGroup color="secondary"
                                      name="dateFilter"
                                      aria-label="date-filter"
                                      key={recipe}
                                      className={classes.root}>
                            <FormControlLabel value={recipe}
                                             color={"secondary"}
                                             control={<Checkbox color={"secondary"}
                                                                checked={filteredRecipes.has(recipe)}
                                                                onChange={updateFilteredRecipe}
                                                                name={recipe}/>}
                                             label={<FormLabel color={"secondary"}>{recipe}</FormLabel>}/>
                        </FormGroup>
                })
            }
        </div> : <div></div> }
    </div>
};
