import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Radio from "@material-ui/core/Radio/Radio";
import React from "react";

// Time, in days, from now for which to search the request list on the @dateFilterField
export const DF_WEEK = "7";
export const DF_MONTH = "30";
export const DF_YEAR = "365";
export const DF_ALL = "5000";

const mapFilter = {
    [DF_WEEK]: "Week",
    [DF_MONTH]: "Month",
    [DF_YEAR]: "Year",
    [DF_ALL]: "All"
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
