import { generateCertifications } from '../services/aiService.js';
import logger from '../utils/logger.js';

export const getCertifications = async (req, res, next) => {
  const { domain, experience, skills } = req.body;

  if (!domain || !experience) {
    return res.status(400).json({ message: 'Domain and Experience are required.' });
  }

  try {
    logger.info(`Fetching certifications for Domain: ${domain}, Experience: ${experience}`);
    const data = await generateCertifications(domain, experience, skills || 'None provided');
    res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in getCertifications: ${error.message}`);
    next(error);
  }
};
