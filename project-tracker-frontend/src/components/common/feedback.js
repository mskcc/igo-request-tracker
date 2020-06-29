import React, { useEffect, useState }  from "react";
import MuiButton from "@material-ui/core/Button/Button";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MuiDownshift from 'mui-downshift'
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {submitFeedbackRequest} from "../../services/feedback";
import {useSelector} from "react-redux";
import {STATE_DELIVERED_PROJECTS, STATE_UNDELIVERED_PROJECTS} from "../../redux/reducers";

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

    const generateTextInput = (label, val, fn) => {
        return <div className={"text-input-single-line-container"}>
            <p className={"inline"}>{label}</p>
            <input className={"inline float-right"}
                   type="text"
                   value={val}
                   onChange={(evt) => fn(evt.target.value)} />
        </div>
    };

    const getSubject = () => {
        if(feedbackType === INCORRECT_STATUS){
            const list = Array.from(projectList);
            const filtered = list.filter((item) => {
               return item.startsWith(bugProject);
            });
            const projectError = filtered.length === 0;

            const input = formatStringList(filtered);

            return <div className={"block fill-width"}>
                <div className={"dropdown-container"}>
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
                            autoFocus: true,
                            error: projectError,
                            label: projectError
                                ? 'Please provide a valid project'
                                : 'Enter project',
                        })}
                        loading={projectList.length === 0}
                        includeFooter={false}
                        menuItemCount={10}
                        focusOnClear
                    />
                </div>
                {generateTextInput("Stages", bugStages, setBugStages)}
                {generateTextInput("Samples", bugSamples, setBugSamples)}
            </div>
        } else {
            return <div className={"block fill-width"}>
                {generateTextInput("Subject", feedbackSubject, setFeedbackSubject)}
            </div>
        }
    };

    const getHelpText = () => {
        if(feedbackType === INCORRECT_STATUS){
            return "Please provide the projectID, stages and/or statuses that are incorrect. In the comments, please provide the expected and actual values.";
        } else {
            return "Please describe the issue or feature you would like added and what it would help you with";
        }
    };

    const submitFeedback = () => {
        let subjectLine = feedbackSubject;
        // Override the feedback subject w/ form version w/ project/sample/stages specified
        if(feedbackType === INCORRECT_STATUS){
            // Prefix the subject line w/ either the project/samples
            if(bugProject !== ''){
                subjectLine += `Project: ${bugProject}, `;
            } else if (bugSamples != ''){
                subjectLine += `Sample(s): ${bugSamples}`;
            }
            // Add a substring of the stages
            if(bugStages !== ''){
                subjectLine += `Stages: ${bugStages.substring(0,15)}`;
            }
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
                <p className={"text-align-center font-bold"}>What type of feedback?</p>
                <div className={"margin-left-10"}>
                    <label>
                        <p className={"inline"}>Incorrect Status</p>
                    </label>
                    <input className={"margin-left-10 inline-block hover"}
                           type="radio"
                           value={INCORRECT_STATUS}
                           onChange={() => setFeedbackType(INCORRECT_STATUS)}
                           checked={feedbackType === INCORRECT_STATUS} />
                    <label className={"margin-left-10"}>
                        <p className={"inline"}>Other</p>
                    </label>
                    <input className={"margin-left-10 inline-block hover"}
                           type="radio"
                           value={OTHER}
                           onChange={() => setFeedbackType(OTHER)}
                           checked={feedbackType === OTHER} />
                </div>
                <label className={"inline-block margin-vert-20 fill-width"}>
                    {getSubject()}
                </label>
                <div>
                    <p className={"margin-left-10 italics mskcc-dark-gray"}>{getHelpText()}</p>
                </div>
                <label className={"inline-block fill-width margin-top-15"}>
                <textarea className={"feedback-text"}
                          type="textarea"
                          value={feedbackBody}
                          onChange={(evt) => setFeedbackBody(evt.target.value)} />
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
