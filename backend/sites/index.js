/**
 * Index file that exports all site scraper functions
 */

const fetchSpaniProducts = require('./spani');
const fetchAtacadaoProducts = require('./atacadao');
const fetchTendaProducts = require('./tenda');

module.exports = {
  fetchSpaniProducts,
  fetchAtacadaoProducts,
  fetchTendaProducts
};