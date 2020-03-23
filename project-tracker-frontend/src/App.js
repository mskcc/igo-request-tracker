import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './App.css';
import { getProjects } from "./services/services";
import { updateProjects } from "./redux/dispatchers";
import ProjectTracker from "./components/project-tracker";
import { Container } from "react-bootstrap";

function App() {
    const stateProjects = useSelector(state => state.projects );
    const dispatch = useDispatch();

    // TODO - remove (force login)
    useEffect(() => {

    }, [dispatch]);

    useEffect(() => {
        getProjects()
            .then((projectList) => {
                const requests = projectList['requests'] || [];
                const projectMap = {};
                for (const project of requests) {
                    projectMap[project] = null;
                }
                updateProjects(dispatch, projectMap);
            })
            .catch((err) => {
                // TODO - update UI
                console.error(`Failed to retrieve projects: ${err}`);
            })
    }, [dispatch]);

    return (
        <div className="App">
            <header className="App-header">
                <h1>IGO Project Tracker</h1>
            </header>
            <body>
                <Container className={"margin-vert-20"}>
                    <div className={"border"}>
                        <div className={"light-gray-background"}>
                            <h2>Your Projects</h2>
                        </div>
                        { Object.keys(stateProjects).map((projectName) => {
                            return <ProjectTracker projectName={projectName}/>
                        })}
                    </div>
                </Container>
            </body>
        </div>
    );
}

export default App;
