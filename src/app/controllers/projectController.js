const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const Project = require('../models/project');
const Task = require('../models/Task');

router.use(authMiddleware);

router.get('/', async (req, res) => {
	try {
		const projects = await Project.find().populate(['user', 'tasks']);
		return res.send({ projects });
	} catch (err) {
		return res.status(400).send({ error: 'Error creating project' });
	}
});

router.get('/:projectId', async (req, res) => {
	try {
		const projects = await Project.findById(req.params.projectId).populate(['user', 'tasks']);
		return res.send({ projects });
	} catch (err) {
		return res.status(400).send({ error: 'Error recovering project' });
	}
});

router.put('/:projectId', async (req, res) => {
	try {
		const { title, description, tasks } = req.body;
		const project = await Project.findByIdAndUpdate(req.params.projectId,{
			title, 
			description,
		}, {	new: true });

		project.tasks = [];
		await Task.remove({ project: project._id });

		await Promise.all(tasks.map(async task => {
			const projectTask = new Task({ ...task, project: project._id });

			await projectTask.save();

			project.tasks.push(projectTask);
		}));

		await project.save();

		return res.send({ project });
	} catch (err) {
		return res.status(400).send({ error: 'Error updating project 1' });
	}
});

router.delete('/:projectId', async (req, res) => {
	try {
		await Project.findByIdAndDelete(req.params.projectId);

		return res.send();
	} catch (err) {
		return res.status(400).send({ error: 'Error recovering project' });
	}
});

router.post('/', async (req, res) => {
	try {
		const { title, description, tasks } = req.body; 
		const project = await Project.create({title, description, user: req.userId });

		await Promise.all(tasks.map(async task =>{
			const projectTask = new Task({...task, project: project._id});

			await projectTask.save();
			
			project.tasks.push(projectTask);
		}));

		await project.save();

		return res.send({ project });
	} catch (err) {
		return res.status(400).send({ error: 'Error creating project 1' });
	}
});

module.exports = app => app.use('/projects', router);
