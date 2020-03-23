const NodeCache = require("node-cache");
const { logger } = require("./winston");

/**
 * Class for caching data.
 *
 * Reference - https://medium.com/@danielsternlicht/caching-like-a-boss-in-nodejs-9bccbbc71b9b
 */
class Cache {
	constructor(ttlSeconds) {
		this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
	}

	get(key, storeFunction) {
		const value = this.cache.get(key);
		if (value) {
			logger.log("info", `Returning cached value for ${key}`);
			return Promise.resolve(value);
		}

		logger.log("info", `Retrieving new value for ${key}`);
		return storeFunction().then((result) => {
			this.cache.set(key, result);
			return result;
		});
	}

	del(keys) {
		this.cache.del(keys);
	}

	delStartWith(startStr = "") {
		if (!startStr) {
			return;
		}

		const keys = this.cache.keys();
		for (const key of keys) {
			if (key.indexOf(startStr) === 0) {
				this.del(key);
			}
		}
	}

	flush() {
		this.cache.flushAll();
	}
}

module.exports = Cache;
