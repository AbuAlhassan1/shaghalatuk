/**
 * Configuration Loader for MyResume Website
 */

document.addEventListener('DOMContentLoaded', function () {
    class ConfigLoader {
        constructor() {
            this.lastConfigString = '';
            this.pollInterval = 2000; // Check every 2 seconds
            this.init();
        }

        init() {
            // Initial load
            this.loadConfig();

            // Set up polling for changes
            setInterval(() => this.loadConfig(), this.pollInterval);
        }

        async loadConfig() {
            try {
                const response = await fetch('config.json?' + new Date().getTime());
                if (!response.ok) {
                    throw new Error(`Failed to load configuration file: ${response.status} ${response.statusText}`);
                }

                let config;
                try {
                    config = await response.json();
                } catch (parseError) {
                    throw new Error(`Failed to parse configuration file: ${parseError.message}`);
                }

                // Validate configuration
                ConfigValidator.validateConfig(config);

                // Only update if config has changed
                const configString = JSON.stringify(config);
                if (this.lastConfigString !== configString) {
                    this.lastConfigString = configString;
                    this.applyConfiguration(config);
                    console.log('Configuration updated at:', new Date().toLocaleTimeString());

                    // Dispatch event for other components
                    window.dispatchEvent(new CustomEvent('configUpdated', { detail: config }));
                }
            } catch (error) {
                console.error('Error loading configuration:', error);
                this.showConfigError(error);
            }
        }

        applyConfiguration(config) {
            // Apply site metadata
            this.applySiteMetadata(config.site);

            // Apply personal information
            this.applyPersonalInfo(config.personal);

            // Apply navigation
            this.applyNavigation(config.navigation);

            // Apply social links
            this.applySocialLinks(config.social);

            // Apply sections
            this.applySections(config.sections);

            // Apply footer
            this.applyFooter(config.footer);

            // Refresh portfolio if it exists
            this.refreshPortfolio();
        }

        applySiteMetadata(siteConfig) {
            if (!siteConfig) return;

            // Update page title
            document.title = siteConfig.title || '';

            // Update meta tags
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = siteConfig.description || '';

            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) metaKeywords.content = siteConfig.keywords || '';

            // Update favicon and apple touch icon
            const favicon = document.querySelector('link[rel="icon"]');
            if (favicon) favicon.href = siteConfig.favicon || '';

            const touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
            if (touchIcon) touchIcon.href = siteConfig.appleTouchIcon || '';

            // Set language and direction
            if (siteConfig.language) {
                document.documentElement.lang = siteConfig.language;
            }

            if (siteConfig.direction) {
                document.documentElement.dir = siteConfig.direction;
            }
        }

        applyPersonalInfo(personalConfig) {
            if (!personalConfig) return;

            // Update hero name and footer name
            document.querySelectorAll('.hero h2, .sitename').forEach(element => {
                if (element) element.textContent = personalConfig.name || '';
            });

            // Update typed text
            if (personalConfig.profession && personalConfig.profession.typedItems) {
                this.updateTypedText(personalConfig.profession.typedItems);
            }

            // Update hero background image
            const heroImage = document.querySelector('#hero img');
            if (heroImage && personalConfig.heroBgImage) {
                heroImage.src = personalConfig.heroBgImage;
                heroImage.alt = personalConfig.name;
            }

            // Update footer description
            const footerDesc = document.querySelector('.footer-description');
            if (footerDesc && personalConfig.footerDescription) {
                footerDesc.textContent = personalConfig.footerDescription;
            }
        }

        updateTypedText(items) {
            const typedElement = document.querySelector('.typed');
            if (!typedElement) return;

            // Destroy existing instance if it exists
            if (window.typedInstance) {
                window.typedInstance.destroy();
            }

            // Create new Typed instance
            window.typedInstance = new Typed('.typed', {
                strings: items,
                loop: true,
                typeSpeed: 100,
                backSpeed: 50,
                backDelay: 2000
            });
        }

        applySocialLinks(socialConfig) {
            if (!socialConfig) return;

            const socialLinks = document.querySelector('.social-links');
            if (!socialLinks) return;

            Object.entries(socialConfig).forEach(([platform, data]) => {
                const link = socialLinks.querySelector(`a[data-platform="${platform}"]`);
                if (link) {
                    if (data.enabled) {
                        link.href = data.link || '#';
                        link.style.display = '';
                    } else {
                        link.style.display = 'none';
                    }
                }
            });
        }

        applySections(sections) {
            if (!sections) return;

            // Apply portfolio section
            if (sections.portfolio) {
                this.applyPortfolioSection(sections.portfolio);
            }
        }

        applyPortfolioSection(portfolioConfig) {
            const portfolioSection = document.querySelector('#portfolio');
            if (!portfolioSection) return;

            // Update title and description
            const title = portfolioSection.querySelector('.section-title h2');
            if (title) title.textContent = portfolioConfig.title || '';

            // Update section description
            const sectionDesc = portfolioSection.querySelector('.section-title p');
            if (sectionDesc) sectionDesc.textContent = portfolioConfig.description || '';

            const description = portfolioSection.querySelector('.section-title p');
            if (description) description.textContent = portfolioConfig.description || '';

            // Update portfolio items
            this.updatePortfolioItems(portfolioConfig);
        }

        updatePortfolioItems(portfolioConfig) {
            const container = document.querySelector('.portfolio-container');
            if (!container) return;

            // Clear existing items
            container.innerHTML = '';

            // Generate items HTML based on category structure
            let itemsHTML = '';
            Object.entries(portfolioConfig.categories).forEach(([categoryId, category]) => {
                category.projects.forEach(project => {
                    itemsHTML += `
                        <div class="col-lg-4 col-md-6 portfolio-item filter-${categoryId}">
                            <div class="portfolio-wrap">
                                <img src="${project.image}" class="img-fluid" alt="${project.title}">
                                <div class="portfolio-info">
                                    <h4>${project.title}</h4>
                                    <p>${project.shortDescription}</p>
                                    <div class="portfolio-links">
                                        <a href="${project.image}" 
                                           data-gallery="portfolioGallery" 
                                           class="portfolio-lightbox" 
                                           title="${project.title}">
                                            <i class="bi bi-plus"></i>
                                        </a>
                                        <a href="${project.projectUrl}" 
                                           class="portfolio-details-link" 
                                           title="More Details">
                                            <i class="bi bi-link"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                });
            });

            container.innerHTML = itemsHTML;
            this.refreshPortfolio();
        }

        refreshPortfolio() {
            // Initialize lightbox
            GLightbox({
                selector: '.portfolio-lightbox'
            });

            // Initialize isotope if available
            const portfolioContainer = document.querySelector('.portfolio-container');
            if (portfolioContainer && window.Isotope) {
                const ptIsotope = new Isotope(portfolioContainer, {
                    itemSelector: '.portfolio-item',
                    layoutMode: 'fitRows'
                });

                const portfolioFilters = document.querySelectorAll('#portfolio-filters li');
                portfolioFilters.forEach(filter => {
                    filter.addEventListener('click', (e) => {
                        e.preventDefault();
                        portfolioFilters.forEach(f => f.classList.remove('filter-active'));
                        filter.classList.add('filter-active');
                        ptIsotope.arrange({
                            filter: filter.getAttribute('data-filter')
                        });
                    });
                });
            }
        }

        applyFooter(footerConfig) {
            if (!footerConfig) return;

            const copyrightElement = document.querySelector('.copyright');
            if (copyrightElement) {
                copyrightElement.textContent = footerConfig.copyright || '';
            }

            const descriptionElement = document.querySelector('.footer-description');
            if (descriptionElement) {
                descriptionElement.textContent = footerConfig.description || '';
            }
        }
    }

    // Initialize the config loader
    window.configLoader = new ConfigLoader();
});
