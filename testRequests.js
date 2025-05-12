

console.log('oki');

let Ping = document.querySelector("#Ping");
let AllCvButton = document.querySelector("#GetAllCvs");
let GetCvByUserButton = document.querySelector("#GetCvByUser");
let GetCvByIdButton = document.querySelector("#GetCvById");
let UpdateCvButton = document.querySelector("#UpdateCv");
let CreateCVButton = document.querySelector("#CreateCv");
let DeleteCVButton = document.querySelector("#DeleteCv");
let LoginButton = document.querySelector("#Login");


Ping.onclick = () => {
    fetch('http://localhost:7000/api/ping', {
        method: 'GET',
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
        });
};

AllCvButton.onclick = () => {
    fetch('http://localhost:7000/api/cv/all/', {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(res => res.json())
        .then(data => console.log(data));
};


GetCvByUser.onclick = () => {    
    fetch('http://localhost:7000/api/cv/user', {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(res => res.json())
        .then(data => console.log(data));
};

GetCvById.onclick = () => {
    fetch('http://localhost:7000/api/cv/68214e75a079cf4350558230', { //id du cv
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(res => res.json())
        .then(data => console.log(data));
};


CreateCv.onclick = () => {

    let data = {
        name: "CV_Alexis",
        content: [
            {
              "name": "CV_Alexis",
              "content": {
                "cv": {
                  "metadata": {
                    "title": "Surveillant Collège",
                    "theme": "modern"
                  },
                  "sections": [
                    {
                      "id": "section-1",
                      "type": "profile", 
                      "layout": {
                        "columns": 2,
                        "style": "horizontal"
                      },
                      "data": {
                        "fullName": {
                          "value": "Alexis Sanchez",
                          "style": {
                            "fontSize": "24px",
                            "fontWeight": "bold",
                            "align": "left"
                          }
                        },
                        "title": {
                          "value": "Surveillant Collège",
                          "style": {
                            "fontStyle": "italic"
                          }
                        },
                        "contact": {
                          "email": "alexis.sanchez@example.com",
                          "phone": "06 54 89 45 72"
                        }
                      }
                    },
                    {
                      "id": "section-2",
                      "type": "experience",
                      "layout": {
                        "columns": 1,
                        "style": "stacked"
                      },
                      "data": [
                        {
                          "jobTitle": "Ingénieur Logiciel",
                          "company": "TechCorp",
                          "style": {
                            "float": "right",
                            "width": "50%"
                          },
                          "description": "Développement d’applications React et Node.js."
                        },
                        {
                          "jobTitle": "Stagiaire",
                          "company": "StartupX",
                          "style": {
                            "float": "left",
                            "width": "50%"
                          },
                          "description": "Création de prototypes UX/UI."
                        }
                      ]
                    }
                  ],
                  "layout": {
                    "order": ["section-1", "section-2"]
                  }
                }
              },
              "createdAt": "2024-03-09T10:00:00Z",
              "updatedAt": "2024-03-09T12:00:00Z",
              "AIGenerated": true,
              "userId": "6817a2c25e97e03cf3036f32"
            }
        ],
        AIGenerated: false,
        userId: "6817a2c25e97e03cf3036f32"
    };

    fetch('http://localhost:7000/api/cv/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
            console.log(data);            
        });
};

UpdateCv.onclick = () => {
    let data = {
        name: "CV Alexis 2",
    };

    fetch('http://localhost:7000/api/cv/update/68214e75a079cf4350558230', { //<= Id du CV
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
            console.log(data);            
        });
};

DeleteCv.onclick = () => {

    fetch('http://localhost:7000/api/cv/68214e75a079cf4350558230', { //<= Id du CV
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}` 
        },
    })
    .then(res => res.json())
    .then(data => {
            console.log(data);            
        });
};


// LoginButton.onclick = () => {

//     let emailAndPassword = {
//         email: "alexis.sanchez@example.com",
//         password: "password1234"
//     };
    
//     fetch('http://localhost:5000/auth/login', { //attention ici si c'est l'url de AuthService
//         method: 'POST',
//         body: JSON.stringify(emailAndPassword)
//     })
//         .then(res => res.json())
//         .then(data => {
//             console.log(data);
//             localStorage.setItem("token", `${data.token}`);
//         });
// };