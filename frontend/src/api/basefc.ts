import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000'
});

const handleResponse = (res) => res.data;

export const base44 = {
    files: {
        upload: (file) => {
            const formData = new FormData();
            formData.append('file', file);
            return api.post('/upload', formData, {
                headers: {'Content-Type': 'multipart/form-data'}
            }).then(handleResponse);
        }
    },
    entities: {
        Project: {
            list: () => api.get('/projects').then(handleResponse), // Adicionei este para a Home
            filter: (params) => api.get('/projects', { params }).then(handleResponse),
            update: (id, data) => api.patch(`/projects/${id}`, data).then(handleResponse),
            delete: (id) => api.delete(`/projects/${id}`).then(handleResponse),
            create: (data) => api.post('/projects', data).then(handleResponse),
        },
        Objective: {
            filter: (params) => api.get('/objectives', { params }).then(handleResponse),
            create: (data) => api.post('/objectives', data).then(handleResponse),
            update: (id, data) => api.patch(`/objectives/${id}`, data).then(handleResponse),
            delete: (id) => api.delete(`/objectives/${id}`).then(handleResponse),
        },
        Step: {
            filter: (params) => api.get('/steps', { params }).then(handleResponse),
            update: (id, data) => api.patch(`/steps/${id}`, data).then(handleResponse),
            delete: (id) => api.delete(`/steps/${id}`).then(handleResponse),
            bulkCreate: (data) => api.post('/steps/bulk', data).then(handleResponse),
        }

    }
};