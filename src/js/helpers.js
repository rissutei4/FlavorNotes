import {async} from 'regenerator-runtime/runtime';
import {TIMEOUT_SEC} from "./config.js";

export const timeout = function (s) {
    return new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error(`Request took too long! Timeout after ${s} second`));
        }, s * 1000);
    });
};

export const AJAX = async function (url, uploadData = undefined) {
    try {
        const fetchPro = uploadData ? fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        }) : fetch(url);

        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();

        if (!res.ok) throw new Error(`${data.message} (${res.status})`)
        return data;
    } catch (err) {
        throw err;
    }

}
export const wait = function (sec) {
    return new Promise(function (resolve) {
        setTimeout(resolve, sec * 1000);
    });
};
export function validateField(field, value, rules) {
    // Check required field
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return `${field} is required.`;
    }

    // Check minimum length
    if (rules.minLength && value.length < rules.minLength) {
        return typeof rules.message === 'function'
            ? rules.message(value)
            : `The minimum length for ${field} is ${rules.minLength}.`;
    }

    // Check if the value is a valid URL
    if (rules.isUrl && !isValidURL(value)) {
        return `${field} must be a valid URL.`;
    }

    // Check if the value is a number and within the required range
    if (rules.isNumber) {
        if (isNaN(value)) {
            return `${field} must be a number.`;
        }
        if (rules.min && value < rules.min) {
            return typeof rules.message === 'function'
                ? rules.message(value, { min: rules.min, max: rules.max })
                : `${field} must be at least ${rules.min}.`;
        }
        if (rules.max && value > rules.max) {
            return typeof rules.message === 'function'
                ? rules.message(value, { min: rules.min, max: rules.max })
                : `${field} must be less than or equal to ${rules.max}.`;
        }
    }

    // No validation errors
    return null;
}


export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

/*
export const getJSON = async function (url) {
    try {
        const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
        const data = await res.json();

        if (!res.ok) new Error(`Recipe failed with status ${res.status}: ${res.statusText}`);
        return data;
    } catch (err) {
        throw err;
    }

};

export const sendJSON = async function (url, uploadData) {
    try {
        const fetchPro = fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });
        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();

        if (!res.ok) throw new Error(`${data.message} (${res.status})`)
        return data;
    } catch (err) {
        throw err;
    }
}
 */