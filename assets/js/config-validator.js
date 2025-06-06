/**
 * Configuration Validator
 */

class ConfigValidator {
    static validatePortfolioConfig(config) {
        if (!config || typeof config !== 'object') {
            throw new Error('Invalid configuration format');
        }

        if (!config.sections || !config.sections.portfolio) {
            throw new Error('Portfolio section not found in configuration');
        }

        const portfolio = config.sections.portfolio;

        if (!portfolio.filters || !Array.isArray(portfolio.filters)) {
            throw new Error('Portfolio filters not configured correctly');
        }

        if (!portfolio.projects || typeof portfolio.projects !== 'object') {
            throw new Error('Portfolio projects not configured correctly');
        }

        // Validate each filter
        portfolio.filters.forEach(filter => {
            if (!filter.id || !filter.name || !filter.className) {
                throw new Error(`Invalid filter configuration: ${JSON.stringify(filter)}`);
            }
        });

        // Validate each project
        Object.entries(portfolio.projects).forEach(([category, projects]) => {
            if (!Array.isArray(projects)) {
                throw new Error(`Invalid projects array for category ${category}`);
            }

            projects.forEach(project => {
                if (!project.id || !project.title || !project.image || !project.filterClass) {
                    throw new Error(`Invalid project configuration: ${JSON.stringify(project)}`);
                }
            });
        });

        return true;
    }

    static validateConfig(config) {
        try {
            if (!config || typeof config !== 'object') {
                throw new Error('Invalid configuration format');
            }

            // Validate required sections
            if (!config.site) throw new Error('Site configuration missing');
            if (!config.personal) throw new Error('Personal configuration missing');
            if (!config.navigation) throw new Error('Navigation configuration missing');
            if (!config.sections) throw new Error('Sections configuration missing');

            // Validate site section
            const requiredSiteFields = ['title', 'description', 'favicon', 'direction', 'language'];
            requiredSiteFields.forEach(field => {
                if (!config.site[field]) {
                    throw new Error(`Required site field missing: ${field}`);
                }
            });

            // Validate personal section
            if (!config.personal.name) throw new Error('Personal name missing');
            if (!config.personal.profession || !config.personal.profession.typedItems) {
                throw new Error('Personal profession configuration invalid');
            }

            // Validate navigation
            if (!Array.isArray(config.navigation) || config.navigation.length === 0) {
                throw new Error('Navigation configuration invalid');
            }

            // Validate individual sections
            if (config.sections.portfolio && config.sections.portfolio.enabled) {
                this.validatePortfolioConfig(config);
            }

            return true;
        } catch (error) {
            console.error('Configuration validation failed:', error);
            throw error;
        }
    }
}
