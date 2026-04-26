import { load } from './storage.js'
import { popupE } from "@/app/lib/trigger"

export function getData(setData, endpoint, parameters, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')) {
    //map parameters to get parameter format
    let params = new URLSearchParams(parameters).toString();
    console.log('Payload :: ', params)
    const url = `${baseURL}${endpoint}?${params}`;
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include',
        cache: 'no-store'
    })
        .then((res) => {
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (res.status === 404) {
                console.error(`API 404 Not Found: ${url}`);
            }
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.json();
        })
        .then(data => {
            if (!data) return;
            console.log(`From ${endpoint}`, data)
            if (data.error) popupE('Error', data.error)
            else
                try {
                    setData(data);
                } catch (err) {
                    console.log(err)
                }
        })
        .catch(err => {
            console.log(err)
        });
}

export function getFile(name, endpoint, parameters, token = load('adminToken') || load('token')) {
    let params = new URLSearchParams(parameters).toString();
    popupE('Processing', 'Please wait...')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include'
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.blob();
        })
        .then(blob => {
            console.log(blob)
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => {
            console.log(err)
            popupE('Error', 'Server Error')
        });
}

export function downloadFile(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

export function postFile(setData, files, key, data, endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')) {
    popupE('Processing', 'Please wait...')
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            data[key].forEach(item => formData.append(`${key}[]`, item));
        } else {
            formData.append(key, data[key]);
        }
    });

    if (Array.isArray(files)) {
        if (files.length > 0) {
            files.forEach((file) => {
                formData.append(`${key}[]`, file);
            });
        }
    } else if (files) {
        formData.append(key, files);
    }


    const url = `${baseURL}${endpoint}`.trim().replace('api /', 'api/');
    fetch(url, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: formData
    })
        .then((res) => {
            if (!res.ok) {
                return res.text().then(text => {
                    try {
                        const errData = JSON.parse(text);
                        if (errData.errors) throw new Error(errData.errors[Object.keys(errData.errors)[0]]);
                        else throw new Error(errData.message || 'Server Error');
                    } catch (e) {
                        if (e.message !== "Server returned an invalid response (500/404). Check console." && !text.includes("<html")) {
                            throw e;
                        }
                        console.error("Server HTML Error on " + endpoint + ":", text);
                        throw new Error("Server returned an invalid response (500/404). Check console.");
                    }
                });
            }
            return res.json();
        })
        .then((data) => {
            if (data.error) popupE('Error', data.error)
            if (data.message && data.success) popupE('Success', data.message)
            try {
                setData(data);
            } catch (err) {
                console.log(err)
                popupE('Error', 'Error in client worker')
            }
        })
        .catch(err => {
            console.error(`Network error POST ${url}:`, err);
            let errorMessage = err?.message || 'Server File upload Error';
            if (err && err.errors) {
                errorMessage = err.errors[Object.keys(err.errors)[0]];
            }
            popupE('Error', errorMessage);
            try {
                setData({ success: false, message: errorMessage });
            } catch (e) {
                console.error("Callback error:", e);
            }
        });
}

export async function postData(setData, data, endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')) {
    popupE('Processing', 'Please wait...')
    const url = `${baseURL}${endpoint}`.trim().replace('api /', 'api/');
    fetch(url, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (res.status === 404) {
                console.error(`API 404 Not Found: ${url}`);
            }
            if (!res.ok) {
                return res.text().then(text => {
                    try {
                        const errData = JSON.parse(text);
                        if (errData.errors) throw new Error(errData.errors[Object.keys(errData.errors)[0]]);
                        else throw new Error(errData.message || 'Server Error');
                    } catch (e) {
                        if (e.message !== "Server returned an invalid response (500/404). Check console." && !text.includes("<html")) {
                            throw e;
                        }
                        console.error("Server HTML Error on " + endpoint + ":", text);
                        throw new Error("Server returned an invalid response (500/404). Check console.");
                    }
                });
            }
            return res.json();
        })
        .then((data) => {
            if (!data) return;
            console.log(`From ${endpoint}`, data)
            if (data.success === false) popupE('Error', data.message)
            if (data?.success && data?.message) popupE('Success', data.message)
            try {
                setData(data);
            } catch (err) {
                console.log(err)
                popupE('Error', 'Error in client worker')
            }
        })
        .catch(err => {
            console.error(`Network error POST ${url}:`, err);
            let errorMessage = err?.message || 'Server Error';
            if (err && err.errors) {
                errorMessage = err.errors[Object.keys(err.errors)[0]];
            }
            popupE('Error', errorMessage);
            try {
                setData({ success: false, message: errorMessage });
            } catch (e) {
                console.error("Callback error:", e);
            }
        });
}

export async function putData(setData, data, endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')) {
    popupE('Processing', 'Please wait...')
    const url = `${baseURL}${endpoint}`.trim().replace('api /', 'api/');
    fetch(url, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    if (errData.errors) throw new Error(errData.errors[Object.keys(errData.errors)[0]]);
                    else throw new Error(errData.message);
                });
            }
            return res.json();
        })
        .then((data) => {
            console.log(`From ${endpoint}`, data)
            if (data.success === false) popupE('Error', data.message)
            if (data?.success && data?.message) popupE('Success', data.message)
            try {
                setData(data);
            } catch (err) {
                console.log(err)
                popupE('Error', 'Error in client worker')
            }
        })
        .catch(err => {
            console.error(`Network error PUT ${url}:`, err);
            let errorMessage = err?.message || 'Server Error';
            if (err && err.errors) {
                errorMessage = err.errors[Object.keys(err.errors)[0]];
            }
            popupE('Error', errorMessage);
            try {
                setData({ success: false, message: errorMessage });
            } catch (e) {
                console.error("Callback error:", e);
            }
        });
}

export async function deleteData(setData, data, endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')) {
    popupE('Processing', 'Please wait...')
    const url = `${baseURL}${endpoint}`.trim().replace('api /', 'api/');
    fetch(url, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    if (errData.errors) throw new Error(errData.errors[Object.keys(errData.errors)[0]]);
                    else throw new Error(errData.message);
                });
            }
            return res.json();
        })
        .then((data) => {
            console.log(`From ${endpoint}`, data)
            if (data.success === false) popupE('Error', data.message)
            if (data?.success && data?.message) popupE('Success', data.message)
            setData(data);
        })
        .catch(err => {
            console.error(`Network error DELETE ${url}:`, err)
            let errorMessage = err?.message || 'Server Error';
            popupE('Error', errorMessage);
            try {
                setData({ success: false, message: errorMessage });
            } catch (e) {
                console.error("Callback error:", e);
            }
        })
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetcher([endpoint, parameters, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')]) {
    let params = new URLSearchParams(parameters).toString();
    const url = `${baseURL}${endpoint}?${params}`;
    
    // Circuit Diagnostic Log
    console.log(`[Circuit Diagnostic] Connecting to: ${url}`);
    if (!token) console.error(`[Circuit Diagnostic] WARNING: No Authorization Token Found.`);

    return fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include',
        cache: 'no-store'
    })
        .then((res) => {
            if (res.status === 401) {
                console.error(`[Circuit Diagnostic] ACCESS DENIED (401) at ${url}`);
                window.location.href = '/login';
                return;
            }
            if (res.status === 404) {
                console.error(`[Circuit Diagnostic] NOT FOUND (404) at ${url}`);
            }
            if (!res.ok) {
                return res.json().then(errData => {
                    console.error(`[Circuit Diagnostic] SERVER ERROR (${res.status}):`, errData);
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.json();
        })
}

export async function postFetcher([endpoint, parameters, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')]) {
    return fetch(`${baseURL}${endpoint}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(parameters),
        credentials: 'include'
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.json();
        })
}

export async function putFetcher([endpoint, parameters, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')]) {
    return fetch(`${baseURL}${endpoint}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(parameters),
        credentials: 'include'
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.json();
        })
}

export async function blobFetcher([url, token = load('adminToken') || load('token')]) {
    return fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include'
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.blob();
        });
}

export async function postFileFetcher(files, key, data, endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')) {
    const formData = new FormData();
    Object.keys(data).forEach(dataKey => {
        if (Array.isArray(data[dataKey])) {
            data[dataKey].forEach(item => formData.append(`${dataKey}[]`, item));
        } else {
            formData.append(dataKey, data[dataKey]);
        }
    });

    if (Array.isArray(files)) {
        if (files.length > 0) {
            files.forEach((file) => {
                formData.append(`${key}[]`, file);
            });
        }
    } else if (files) {
        formData.append(key, files);
    }

    return fetch(`${baseURL}${endpoint}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: formData
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    if (errData.errors) throw new Error(errData.errors[Object.keys(errData.errors)[0]]);
                    else throw new Error(errData.message);
                });
            }
            return res.json();
        });
}

export async function postRequest(endpoint, data, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')) {
    const url = `${baseURL}${endpoint}`.trim().replace('api /', 'api/');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };

    let body;
    if (data instanceof FormData) {
        body = data;
    } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
    }

    const res = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body
    });

    if (res.status === 401) {
        window.location.href = '/login';
        return;
    }

    return await res.json();
}

export async function deleteRequest(endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('adminToken') || load('token')) {
    const url = `${baseURL}${endpoint}`.trim().replace('api /', 'api/');
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include'
    });

    if (res.status === 401) {
        window.location.href = '/login';
        return;
    }

    return await res.json();
}