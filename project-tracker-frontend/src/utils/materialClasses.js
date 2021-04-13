import {makeStyles} from "@material-ui/core/styles";

export const useTooltipStyles = () => {
    return makeStyles({
        tooltip: {
            fontSize: 16,
            maxWidth: 1000
        }
    })();
};
