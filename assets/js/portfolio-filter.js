/**
 * Portfolio Filter Functionality - Debug Version
 * This script specifically handles the portfolio filter functionality
 */

// Wait until the DOM is fully loaded
window.addEventListener('load', function () {
    console.log('Portfolio filter script loaded');

    // Direct approach with minimal dependencies
    const portfolioFilters = document.querySelector('.portfolio-filters, .isotope-filters');
    const portfolioItems = document.querySelectorAll('.portfolio-item, .isotope-item');

    console.log('Found filters:', portfolioFilters);
    console.log('Found items:', portfolioItems.length);

    if (!portfolioFilters || portfolioItems.length === 0) {
        console.error('Required portfolio elements not found!');
        return;
    }

    // Get all filter buttons
    const filterButtons = portfolioFilters.querySelectorAll('li');
    console.log('Found filter buttons:', filterButtons.length);

    // Manual filtering implementation (backup in case Isotope fails)
    function manualFilter(filter) {
        console.log('Manual filtering with:', filter);

        portfolioItems.forEach(function (item) {
            if (filter === '*') {
                item.style.display = 'block';
            } else {
                if (item.classList.contains(filter.replace('.', ''))) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    }

    // Add click event to each filter button
    filterButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const filterValue = this.getAttribute('data-filter');
            console.log('Filter button clicked:', filterValue);

            // Update active class
            filterButtons.forEach(btn => btn.classList.remove('filter-active'));
            this.classList.add('filter-active');

            // Try both filtering methods
            try {
                // Try to use Isotope if available
                const container = document.querySelector('.isotope-container');
                if (window.Isotope && container) {
                    console.log('Using Isotope filtering');

                    // Initialize Isotope if not already done
                    if (!window.portfolioIsotope) {
                        window.portfolioIsotope = new Isotope(container, {
                            itemSelector: '.isotope-item, .portfolio-item',
                            layoutMode: 'masonry'
                        });
                    }

                    // Filter with Isotope
                    window.portfolioIsotope.arrange({
                        filter: filterValue
                    });

                    // Force relayout
                    setTimeout(function () {
                        window.portfolioIsotope.layout();
                    }, 300);
                } else {
                    // Fallback to manual filtering
                    manualFilter(filterValue);
                }
            } catch (error) {
                console.error('Error filtering:', error);
                // Use the manual method as fallback
                manualFilter(filterValue);
            }

            return false;
        });
    });

    // Initialize with the "All" filter
    const allFilterBtn = document.querySelector('.isotope-filters li[data-filter="*"], .portfolio-filters li[data-filter="*"]');
    if (allFilterBtn) {
        console.log('Setting initial "All" filter');
        allFilterBtn.click();
    }
});
