/**
 * All the API calls
 */

const BASEURL = '/api';

function getJson(httpResponsePromise) {
    return new Promise((resolve, reject) => {
        httpResponsePromise
            .then((response) => {
                if (response.ok) {

                    // always return {} from server, never null or non json, otherwise it will fail
                    response.json()
                        .then(json => {
                            resolve(json)
                        })
                        .catch(err => {
                            reject({error: "Cannot parse server response"})
                        })

                } else {
                    // analyze the cause of error
                    response.json()
                        .then(obj => reject(obj)) // error msg in the response body
                        .catch(err => reject({error: "Cannot parse server response"})) // something else
                }
            })
            .catch(err => reject({error: "Cannot communicate"})) // connection error
    });
}

const getSurveys = async () => {
    return getJson(
        fetch(BASEURL + '/surveys')
    ).then(json => {
        return json.map((survey) => Object.assign({}, survey))
    })
}
const getSurveysAdmin = async () => {
    return getJson(
        fetch(BASEURL + '/admin')
    ).then(json => {
        return json.map((survey) => Object.assign({}, survey))
    })
}

function addAnswers(results, id, user) {
    //console.log(results);
    //console.log(survey)
    //console.log(user);
    return getJson(
        fetch(BASEURL + "/surveys/" + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            //body: JSON.stringify({answers: results, survey: survey.id, user: user})
            body: JSON.stringify({answers: JSON.stringify(results), survey: id, user: user})
        })
    )
}

function addSurveys(survey, id) {
    //console.log(results);
    //console.log(survey)
    //console.log(user);
    return getJson(
        fetch(BASEURL + "/admin/creation", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            //body: JSON.stringify({answers: results, survey: survey.id, user: user})
            body: JSON.stringify({title: survey.title, admin: id, questions: JSON.stringify(survey.questions)})
        })
    )
}

const getQuestions = async (id) => {
    return getJson(
        fetch(BASEURL + '/surveys/' + id)
    ).then((json) => {
        return json
    })
}

const getAnswers = async (id) => {
    return getJson(
        fetch(BASEURL + '/admin/' + id)
    ).then((json) => {
        return json
    })
}

/*
function updateN_answ(survey) {
    console.log(survey);
    return getJson(
        fetch(BASEURL + "/surveys/" + survey.id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({N_answ: (survey.N_answ)+1})
        })
    )
}
*/


async function logIn(credentials) {
    let response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const admin = await response.json();
        return admin;
    } else {
        try {
            const errDetail = await response.json();
            throw errDetail.message;
        } catch (err) {
            throw err;
        }
    }
}

async function logOut() {
    await fetch('/api/sessions/current', {method: 'DELETE'});
}

async function getAdminInfo() {
    const response = await fetch(BASEURL + '/sessions/current');
    const adminInfo = await response.json();
    if (response.ok) {
        return adminInfo;
    } else {
        throw adminInfo;  // an object with the error coming from the server, mostly unauthenticated user
    }
}

const API = {getAnswers, getSurveys, getSurveysAdmin, getQuestions, logOut, getAdminInfo, logIn, addAnswers, addSurveys}
export default API;

