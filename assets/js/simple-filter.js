/**
 * Enhanced Simple Portfolio Filter Script
 */

// Wait for page to be fully loaded
window.addEventListener('load', function () {
  console.log('Enhanced portfolio filter script executing');

  // Get filter elements
  const filterButtons = document.querySelectorAll('.portfolio-filters li, .isotope-filters li');
  const portfolioItems = document.querySelectorAll('.portfolio-item, .isotope-item');
  const portfolioRow = document.querySelector('.isotope-container');

  console.log('Filter buttons found:', filterButtons.length);
  console.log('Portfolio items found:', portfolioItems.length);

  if (filterButtons.length === 0 || portfolioItems.length === 0) {
    console.error('Required portfolio elements not found');
    return;
  }

  // Add custom transition for smooth filtering
  portfolioItems.forEach(item => {
    item.style.transition = 'all 0.4s ease-in-out';
  });

  // Function to add animation and filter items
  function filterPortfolio(filter) {
    console.log('Applying filter:', filter);

    // Handle showing/hiding of items
    portfolioItems.forEach(item => {
      if (filter === '*') {
        // Show all items
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
        setTimeout(() => { item.style.display = ''; }, 50);
      } else if (item.classList.contains(filter.replace('.', ''))) {
        // Show matching items
        item.style.display = '';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, 50);
      } else {
        // Hide non-matching items
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
        setTimeout(() => { item.style.display = 'none'; }, 400);
      }
    });

    // Force browser reflow to improve layout
    setTimeout(() => {
      if (portfolioRow) {
        portfolioRow.style.height = 'auto';

        // Trigger resize event to help any responsive layouts adjust
        window.dispatchEvent(new Event('resize'));
      }
    }, 500);
  }

  // Add click event to each filter button
  filterButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();

      const filterValue = this.getAttribute('data-filter');

      // Update active class
      filterButtons.forEach(btn => btn.classList.remove('filter-active'));
      this.classList.add('filter-active');

      // Apply filter with animation
      filterPortfolio(filterValue);

      return false; // Prevent default behavior
    });
  });

  // Trigger the "All" filter by default
  const defaultFilter = document.querySelector('.filter-active') || document.querySelector('[data-filter="*"]');
  if (defaultFilter) {
    setTimeout(() => {
      defaultFilter.click();
    }, 300); // Small delay for initial page load
  }
});
