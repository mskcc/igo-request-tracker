import React, { useEffect, useState }  from "react";
import MuiButton from "@material-ui/core/Button/Button";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MuiDownshift from 'mui-downshift'
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {submitFeedbackRequest} from "../../services/feedback";
import {useSelector} from "react-redux";
import {STATE_DELIVERED_PROJECTS, STATE_UNDELIVERED_PROJECTS} from "../../redux/reducers";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";

const INCORRECT_STATUS = "INCORRECT_STATUS";
const OTHER = "OTHER";

const Feedback = (props) => {
    const [feedbackType, setFeedbackType] = useState(INCORRECT_STATUS);
    const [feedbackBody, setFeedbackBody] = useState("");
    const [feedbackSubject, setFeedbackSubject] = useState("");
    const [bugProject, setBugProject] = useState("");
    const [bugSamples, setBugSamples] = useState("");
    const [bugStages, setBugStages] = useState("");
    const [projectList, setProjectList] = useState(new Set());

    const unDelivered = useSelector(state => state[STATE_UNDELIVERED_PROJECTS] );
    const delivered =  useSelector(state => state[STATE_DELIVERED_PROJECTS] );

    const updateProjectList = (projectState) => {
        const pList = Object.keys(projectState);
        if(pList && pList.length > 0){
            for(const project of pList){
                projectList.add(project);
            }
        }
        return projectList;
    };

    useEffect(() => {
        const updatedSet = updateProjectList(unDelivered);
        setProjectList(updatedSet);
    }, [unDelivered]);
    useEffect(() => {
        const updatedSet = updateProjectList(delivered);
        setProjectList(updatedSet);
    }, [delivered]);

    const formatStringList = (list) => {
        const formatted = list.map((item) => {
            return {
                label: item
            }
        });
        return formatted;
    };

    const getTargetValue = (evt) => {
        return evt.target.value;
    };

    const generateTextInput = (label, val, fn, required = false) => {
        return <TextField  id="standard-basic"
                           className={"fill-width"}
                           label={label}
                           onChange={(evt) => fn(getTargetValue(evt))}
                           required={required}/>;
    };

    const getSubject = () => {
        if(feedbackType === INCORRECT_STATUS){
            const list = Array.from(projectList);
            const filtered = list.filter((item) => {
               return item.startsWith(bugProject);
            });
            const projectError = filtered.length === 0;

            const input = formatStringList(filtered);

            return <div className={"feedback-inputs"}>
                <MuiDownshift
                    items={input}
                    onStateChange={(evt) => {
                        const nxt = evt.inputValue;
                        if(nxt){
                            setBugProject(nxt)
                        }
                    }}
                    getInputProps={() => ({
                        id: 'project-selector-feedback',
                        autoFocus: false,
                        error: projectList.length > 0 && projectError,
                        label: projectError
                            ? 'Please provide a valid project'
                            : 'Enter project',
                    })}
                    loading={projectList.length === 0}
                    includeFooter={false}
                    menuItemCount={10}
                    focusOnClear
                />
                {generateTextInput("Stages", bugStages, setBugStages, false)}
                {generateTextInput("Samples", bugSamples, setBugSamples, false)}
            </div>
        } else {
            return <div className={"feedback-inputs"}>
                {generateTextInput("Subject", feedbackSubject, setFeedbackSubject, true)}
            </div>
        }
    };

    const getHelpText = () => {
        if(feedbackType === INCORRECT_STATUS){
            return "Please provide the expected and actual values if relevant.";
        } else {
            return "Please describe the issue or feature you would like added and what it would help you with";
        }
    };

    const submitFeedback = () => {
        let subjectLine = feedbackSubject;
        // Override the feedback subject w/ form version w/ project/sample/stages specified
        if(feedbackType === INCORRECT_STATUS){
            subjectLine = `Project: ${bugProject}, Stages: ${bugStages.substring(0,15)}`;
        }

        submitFeedbackRequest(feedbackBody, subjectLine,feedbackType)
            .then(() => {
                console.log("Success");
                /*
                props.addModalUpdate(MODAL_UPDATE, "Feedback Submitted. Thanks!", 3000);
                props.closeFeedback();
                */
            })
            .catch((err) => {
                console.error(err.message);
                /*
                props.addModalUpdate(MODAL_ERROR, "Error submitting feedback. Email streidd@mskcc.org", 5000)
                props.closeFeedback();
                */
            })
    };

    const isDisabeled = () => {
        // If submitting project feedback, the subject and text should not be blank
        if(OTHER === feedbackType){
            return feedbackBody === "" || feedbackSubject === "";
        }
        // If submitting an incorrect project report, there must be a valid project
        return bugProject === "" || (!projectList.has(bugProject));
    };

    return <div className={"feedback-form padding-24"}>
        <FontAwesomeIcon className={"status-change-close hover"}
                         icon={faTimes}
                         onClick={() => props.closeFeedback()}/>
        <div className={"feedback-container"}>
            <form className={"fill-width"}>
                <h5 className={"text-align-center bold"}>What type of feedback?</h5>
                <div className={"margin-left-20"}>
                    <RadioGroup aria-label="feedback-type"
                                name="feedback-type"
                                defaultValue={INCORRECT_STATUS}
                                onChange={(evt) => setFeedbackType(getTargetValue(evt))}>
                        <FormControlLabel value={INCORRECT_STATUS} control={<Radio />} label="Incorrect Status" />
                        <FormControlLabel value={OTHER} control={<Radio />} label="Other" />
                    </RadioGroup>
                </div>
                <div className={"inline-block fill-width"}>
                    {getSubject()}
                </div>
                <label className={"margin-vert-20"}>
                    <p className={"margin-left-10 italic mskcc-dark-gray no-margin-bottom"}>{getHelpText()}</p>
                </label>
                <label className={"inline-block fill-width"}>
                <textarea className={"feedback-text"}
                          type="textarea"
                          value={feedbackBody}
                          onChange={(evt) => setFeedbackBody(getTargetValue(evt))} />
                </label>
                <MuiButton
                    variant="contained"
                    onClick={submitFeedback}
                    disabled={isDisabeled()}
                    size={"small"}>Send
                </MuiButton>
            </form>
        </div>
    </div>
};

export default Feedback;

Feedback.propTypes = {
    addModalUpdate: PropTypes.func,
    closeFeedback: PropTypes.bool
};
