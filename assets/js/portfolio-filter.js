/**
 * Portfolio Filter Functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    let portfolioIsotope = null;

    // Function to handle image loading errors
    function handleImageError(img) {
        img.onerror = null; // Prevent infinite loop
        img.src = 'assets/img/portfolio/product-1.jpg'; // Fallback image
    }

    // Listen for config updates
    window.addEventListener('configUpdated', (event) => {
        initPortfolio(event.detail);
    });

    async function initPortfolio(config = null) {
        try {
            console.log('Initializing portfolio...');

            // If config is not provided through event, load it
            if (!config) {
                const response = await fetch('config.json');
                if (!response.ok) {
                    throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
                }

                try {
                    config = await response.json();
                } catch (parseError) {
                    throw new Error(`Failed to parse configuration: ${parseError.message}`);
                }
            }

            // Validate configuration
            ConfigValidator.validatePortfolioConfig(config);

            const portfolioConfig = config.sections.portfolio;

            if (!portfolioConfig) {
                throw new Error('Portfolio configuration not found in config.json');
            }

            // Generate filter buttons
            console.log('Generating filter buttons...');
            let filtersHtml = '';
            portfolioConfig.filters.forEach(filter => {
                filtersHtml += `<li data-filter="${filter.className}" class="${filter.isActive ? 'filter-active' : ''}">${filter.name}</li>`;
            });

            // Update filters in DOM
            const filtersContainer = document.querySelector('.portfolio-filters, .isotope-filters');
            if (filtersContainer) {
                filtersContainer.innerHTML = filtersHtml;
                console.log('Filter buttons updated');
            } else {
                console.error('Filters container not found');
                return;
            }

            // Generate portfolio items
            console.log('Generating portfolio items...');
            let portfolioItemsHtml = '';
            Object.entries(portfolioConfig.projects).forEach(([category, projects]) => {
                projects.forEach(project => {
                    portfolioItemsHtml += `
                        <div class="col-lg-4 col-md-6 portfolio-item ${project.filterClass}">
                            <div class="portfolio-wrap">
                                <div class="portfolio-image">
                                    <img src="${project.image}" class="img-fluid w-100" alt="${project.title}" onerror="handleImageError(this)">
                                </div>
                                <div class="portfolio-content p-4">
                                    <div class="flex items-center mb-2">
                                        <h3 class="text-xl font-bold">${project.title}</h3>
                                        ${project.featured ? '<div class="ml-auto"><span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">Featured</span></div>' : ''}
                                    </div>
                                    <p class="text-gray-600 dark:text-gray-300 mb-4">${project.shortDescription || project.description}</p>
                                    <div class="flex flex-wrap gap-2">
                                        ${project.technologies.map(tech => `<span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">${tech}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>`;
                });
            });

            // Update portfolio items in DOM
            const portfolioContainer = document.querySelector('.isotope-container');
            if (portfolioContainer) {
                portfolioContainer.innerHTML = portfolioItemsHtml;
                console.log('Portfolio items updated');
            } else {
                console.error('Portfolio container not found');
                return;
            }

            // Initialize Isotope after images load
            console.log('Waiting for images to load...');
            const images = portfolioContainer.getElementsByTagName('img');
            let loadedImages = 0;

            function onImageLoad() {
                loadedImages++;
                if (loadedImages === images.length) {
                    initIsotope();
                }
            }

            function initIsotope() {
                console.log('Initializing Isotope...');
                if (typeof Isotope !== 'undefined') {
                    const portfolioIsotope = new Isotope(portfolioContainer, {
                        itemSelector: '.portfolio-item',
                        layoutMode: 'masonry'
                    });

                    // Add click handlers to filters
                    const portfolioFilters = document.querySelectorAll('.portfolio-filters li, .isotope-filters li');
                    portfolioFilters.forEach(filter => {
                        filter.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            console.log('Filter clicked:', filter.getAttribute('data-filter'));

                            portfolioFilters.forEach(el => el.classList.remove('filter-active'));
                            filter.classList.add('filter-active');

                            portfolioIsotope.arrange({
                                filter: filter.getAttribute('data-filter')
                            });

                            portfolioIsotope.on('arrangeComplete', () => {
                                if (typeof AOS !== 'undefined') {
                                    AOS.refresh();
                                }
                            });

                            return false;
                        });
                    });

                    // Set the initial filter
                    const defaultFilter = portfolioConfig.filters.find(f => f.isActive);
                    if (defaultFilter) {
                        const defaultFilterBtn = document.querySelector(`[data-filter="${defaultFilter.className}"]`);
                        if (defaultFilterBtn) {
                            defaultFilterBtn.click();
                        }
                    }
                }
            }

            // Load all images
            Array.from(images).forEach(img => {
                if (img.complete) {
                    onImageLoad();
                } else {
                    img.addEventListener('load', onImageLoad);
                    img.addEventListener('error', onImageLoad); // Count errors as loaded to avoid hanging
                }
            });

            // Initialize with default filter
            const defaultFilter = portfolioConfig.filters.find(f => f.isActive);
            if (defaultFilter) {
                const defaultFilterBtn = document.querySelector(`[data-filter="${defaultFilter.className}"]`);
                if (defaultFilterBtn) {
                    defaultFilterBtn.click();
                }
            }
        } catch (error) {
            if (typeof Isotope === 'undefined') {
                console.error('Isotope library not loaded');
            } else {
                console.error('Error initializing portfolio:', error);
            }
        }
    }

    // Initialize portfolio with configuration
    initPortfolio();
});
