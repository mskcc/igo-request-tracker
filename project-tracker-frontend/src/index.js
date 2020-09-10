import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'react-redux'
import store from './redux/store';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import {createMuiTheme, ThemeProvider} from "@material-ui/core";

const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#e26d37',
            main: '#e26d37',
            dark: '#e26d37',
            contrastText: '#e26d37'
        },
        secondary: {
            light: '#FFFFFF',
            main: '#FFFFFF',
            dark: '#FFFFFF',
            contrastText: '#FFFFFF'
        },
    },
    overrides: {
        /* Cannot secondary/primary to MUI FormLabel when unfocused */
        MuiRadio: {
            root: {
                color: '#FFFFFF'
            },
        },
        /* Cannot secondary/primary to MUI FormLabel */
        MuiFormLabel: {
            root: {
                color: '#FFFFFF'
            }
        }
    }
});


ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
