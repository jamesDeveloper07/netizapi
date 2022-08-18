import React from "react";
import ReactDOM from "react-dom";

// plugins styles from node_modules
import "react-notification-alert/dist/animate.css";
import "react-perfect-scrollbar/dist/css/styles.css";
// plugins styles downloaded
import "./assets/vendor/fullcalendar/dist/fullcalendar.min.css";
import "./assets/vendor/sweetalert2/dist/sweetalert2.min.css";
import "./assets/vendor/select2/dist/css/select2.min.css";
import "./assets/vendor/quill/dist/quill.core.css";
import "./assets/vendor/nucleo/css/nucleo.css";
import "./assets/vendor/@fortawesome/fontawesome-free/css/all.min.css";
import './assets/netiz/css/style.css';

// core styles
import "./assets/scss/argon-dashboard-pro-react.scss?v1.0.0";

import { AuthProvider } from './contexts/Auth'

import ErrorBoundary from './components/ErrorBoundary'
import * as serviceWorker from './serviceWorker';
import { initFirebase } from './services/push-notification'

import App from "./App";

require("dotenv").config();

ReactDOM.render(
    <ErrorBoundary>
        <AuthProvider>
            <App />
        </AuthProvider>
    </ErrorBoundary>
    , document.getElementById('root'));

serviceWorker.register()
initFirebase()