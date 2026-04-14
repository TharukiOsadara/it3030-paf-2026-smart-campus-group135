// create a resourceService that calls the Spring Boot API using axios
// include methods: getResources, getResourceById, createResource, updateResource, deleteResource

import axios from "axios";

const API_URL = "http://localhost:8080/api/resources";

/**
 * @typedef {Object} Resource
 * @property {number=} id
 * @property {string} name
 * @property {string} type
 * @property {string} location
 * @property {number=} capacity
 * @property {boolean=} available
 * @property {string=} status
 */

export const getResources = () => axios.get(API_URL);

export const getResourceById = (id) =>
  axios.get(`${API_URL}/${id}`);

export const createResource = (resource) =>
  axios.post(API_URL, resource);

export const updateResource = (id, resource) =>
  axios.put(`${API_URL}/${id}`, resource);

export const deleteResource = (id) =>
  axios.delete(`${API_URL}/${id}`);
