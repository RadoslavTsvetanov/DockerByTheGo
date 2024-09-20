import { setUpCanvasForWindowOnLoad } from './../../Diagramer_io/tsconfig-master/src/index';
import express from "express";
import { dbRepo } from './db_repo';



const app = express();


app.get('/projects/:projectId', (req, res) => {
    
})


app.post('/projects/:projectId', (req, res) => { 

})

app.get('/users/:userId', (req, res) => {

})


app.get('/templates', (req, res) => { 

    return res.status(200).json({})
})

app.get('/templates/:name', (req, res) => {

    return res.status(200).json({})
})

app.post('/templates', (req, res) => {
    const { template } = req.body;
    dbRepo.template.create(template)
    res.status(200).json({})
})