document.onreadystatechange = function () {
  if (document.readyState == "interactive") {
    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      document.querySelector('h1').innerText = urlParams.get('qs');

    }
  }
}

document.addEventListener('click', function (event) {
  let element = event.target.closest('span[data-href]');
  if (!element) return;
  window.location = atob(element.getAttribute('data-href'));
}, false);

let lastKnownScrollPosition = 0;
let scrollDirection = 'down';

document.addEventListener('scroll', function (event) {
  if (document.body.classList.contains('frontpage')) {
    document.getElementById('header1').classList.toggle('header-translucent', window.scrollY < 200);
  }

  if (window.scrollY > lastKnownScrollPosition) {
    if (scrollDirection === 'up') {
      //document.body.classList.remove('scroll-direction--up');
      //document.body.classList.add('scroll-direction--down');

      document.getElementById('header1').classList.remove('header--ensure-visible');
    }

    scrollDirection = 'down';
  } else {
    if (scrollDirection === 'down') {
      //document.body.classList.remove('scroll-direction--down');
      //document.body.classList.add('scroll-direction--up');

      document.getElementById('header1').classList.add('header--ensure-visible');
    }

    scrollDirection = 'up';
  }

  lastKnownScrollPosition = window.scrollY;
}, { passive: true });

$(document).ready(function () {
  const observer = new IntersectionObserver(function (entries) {
    console.log(entries[0]);

    const entry = entries[0];

    entry.target.classList.toggle('header--out', !entry.isIntersecting);

    entry.target.classList.toggle('header--intersecting', entry.isIntersecting);

    if (document.body.classList.contains('frontpage')) {
      //entry.target.classList.toggle('header-translucent', entry.isIntersecting);
    }
  });

  observer.observe(document.getElementById('header1'));

  if ($('#order_sumary').length !== 0) {
    $('#order_sumary').on('submit', '#basket-submit', function (e) {
      e.preventDefault();
      $.post('/basket', $('#basket-submit').serialize()).done(function () {
        $.get('/address').done(function (data) {
          $('#order_sumary').html($(data).find('#order_sumary').html());
        });
      });
    });
  }

  if ($('.product-addons').length !== 0) {
    var $basketSubmit = false;
    $('.productshop_detail').on('submit', '.productshop_btn form', function (e) {
      if ($basketSubmit) {
        return;
      } else {
        e.preventDefault();
      }
      var $this = $(this);
      $('.product-addons form.product-addon').each(function () {
        if ($(this).find('.product-addon-field:checked').length !== 0) {
          $.post($(this).attr('action'), $(this).serialize()).done();
        }
      });

      setTimeout(function () {
        $basketSubmit = true;
        $this.submit();
      }, 300);
    });
  }

  if ($('.shipping_information').length !== 0) {
    $('#form-address').on('submit', function (e) {
      if (!document.querySelector('#form-address').checkValidity()) {
        e.preventDefault();
        $('.shipping_information input, .shipping_information select').each(function () {
          if (this.checkValidity()) {
            $(this).removeClass('is-invalid');
            $(this).addClass('is-valid');
          } else {
            $(this).removeClass('is-valid');
            $(this).addClass('is-invalid');
          }
        });
      }
    });

    $('.shipping_information').on('change blur', 'input, select', function (e) {
      if (this.checkValidity()) {
        $(this).removeClass('is-invalid');
        $(this).addClass('is-valid');
      } else {
        $(this).removeClass('is-valid');
        $(this).addClass('is-invalid');
      }
    });

    $('.shipping_information').on('change', '.different-address', function (e) {
      if ($(this).val() === '2') {
        $('#collapseSix input, #collapseSix select').removeAttr('disabled');
      } else {
        $('#collapseSix input, #collapseSix select').attr('disabled', '');
      }
    });

    if ($('.shipping_information:checked').val() === '2') {
      $('#collapseSix input, #collapseSix select').removeAttr('disabled');
    } else {
      $('#collapseSix input, #collapseSix select').attr('disabled', '');
    }
  }

  // Get all the brands and add them to a dropdown on category overviewpages
  let productBrands = []
  $('[data-myAttr!=""]').each(function () {
    let brand = $(this).attr("data-brand")

    if (!productBrands.includes(brand) && brand !== undefined && brand !== "") {
      productBrands.push(brand)

      let selectBrand = document.createElement("div")

      let checkbox = document.createElement("input")
      checkbox.setAttribute("type", "checkbox")
      checkbox.setAttribute("id", brand)
      selectBrand.append(checkbox)

      let label = document.createElement("label")
      label.innerText = brand
      label.setAttribute("for", brand)
      selectBrand.append(label)

      $(".sortByBrandList").append(selectBrand)
    }
  })

  // When clicking on a link in the 'sort by' dropdown
  $(".sortByLink").click(function () {
    let filter = $(this).text()
    $(".selectedFilterMethod").text(filter)
    $(this).closest(".sortByDropDown").prev().trigger("click")
  })

  // Display brand list on click
  $(".toggleSortList").click(function () {
    $(this).next().slideToggle()
    if ($(this).children("i").hasClass("fa-angle-down")) {
      $(this).children("i").removeClass("fa-angle-down")
      $(this).children("i").addClass("fa-angle-up")
    } else {
      $(this).children("i").removeClass("fa-angle-up")
      $(this).children("i").addClass("fa-angle-down")
    }
  })

  let showBrandsOnly = []

  // Only show discounted products
  let filterBySale = false
  $("#filterBySale").change(function () {
    filterBySale = !filterBySale
    sortProducts()
  })


  // Clicking on a brand will sort the products 
  $(".sortByBrandList input").change(function () {
    let brand = $(this).attr("id")

    if ($(this).prop("checked")) {
      $(".sortByBrandList input").prop("checked", false)
      $(this).prop("checked", true)
    } else {
      $(".sortByBrandList input").prop("checked", false)
    }


    if (showBrandsOnly.includes(brand)) {
      showBrandsOnly = showBrandsOnly.filter(existingBrand => existingBrand !== brand)
    } else { // Else add it
      showBrandsOnly = []
      showBrandsOnly.push(brand)
    }
    $(this).closest(".sortByBrandList").prev().trigger("click")
    sortProducts()
  })

  function sortProducts() {
    // Display only products on discount
    if (filterBySale) {
      $(".productNotOnSale").css("display", "none")
    } else {
      $(".productNotOnSale").css("display", "block")
    }

    if (showBrandsOnly.length == 0) return

    $(".productInCategoryOverview").each(function () {
      let brand = $(this).attr("data-brand")

      if (!showBrandsOnly.includes(brand)) {
        $(this).css("display", "none")
      } else {
        $(this).css("display", "block")
      }
    })

    if (filterBySale) {
      $(".productNotOnSale").css("display", "none")
    }
  }

  // Eventhandlers for all the 'sort by' options
  $(".sortByName").click(sortProductsByName)
  $(".sortByPriceLow").click(sortProductsByPriceLow)
  $(".sortByPriceHigh").click(sortProductsByPriceHigh)
  $(".sortByDate").click(sortProductsByDate)
  $(".sortByDefault").click(sortProductsByDefault)

  function sortProductsByName() {
    $('[data-sortname]').sort(function (a, b) {
      if (a.dataset.sortname < b.dataset.sortname) {
        return -1;
      } else {
        return 1;
      }
    }).appendTo('.sorted_products');
  }

  function sortProductsByPriceLow() {
    $('[data-sortprice]').sort(function (a, b) {
      if (parseFloat(a.dataset.sortprice) < parseFloat(b.dataset.sortprice)) {
        return -1;
      } else {
        return 1;
      }
    }).appendTo('.sorted_products');
  }

  function sortProductsByPriceHigh() {
    $('[data-sortprice]').sort(function (a, b) {
      if (parseFloat(a.dataset.sortprice) > parseFloat(b.dataset.sortprice)) {
        return -1;
      } else {
        return 1;
      }
    }).appendTo('.sorted_products');
  }

  function sortProductsByDate() {
    $('[data-sortdate]').sort(function (a, b) {
      if (parseFloat(a.dataset.sortdate) < parseFloat(b.dataset.sortdate)) {
        return -1;
      } else {
        return 1;
      }
    }).appendTo('.sorted_products');
  }

  function sortProductsByDefault() {
    $('[data-sortdefault]').sort(function (a, b) {
      if (parseInt(a.dataset.sortdefault) < parseInt(b.dataset.sortdefault)) {
        return -1;
      } else {
        return 1;
      }
    }).appendTo('.sorted_products');
  }




  // Show the correct slider for the default selected variant
  let showVariantById = $(".selectProductVariantImg:first").attr("data-id")
  if (showVariantById) {
    $(".left_productshop").addClass("d-none")
    $(".left_productshop[data-variantid=" + showVariantById + "]").removeClass("d-none")
  }


  // Highlight the clicked variant + display the slider for that variant
  $(".selectProductVariantImg").click(function () {
    // Id of variant
    let variantValue = $(this).attr("data-id")
    // Trigger change on hidden select
    $('.selectProductVariantDropdown').val(variantValue).trigger('change')
    // Display the right slider
    $(".left_productshop").addClass("d-none")
    $(".left_productshop[data-variantid=" + variantValue + "]").removeClass("d-none")
    $(".left_productshop[data-variantid=" + variantValue + "] .slick-slider").slick('slickSetOption', {refresh: true});
    // Highlight the selected variant
    $(".selectProductVariantImg img").css("border", "1px solid transparent")
    $(this).children("img").css("border", "1px solid black")
    // Fix the slider
    fixSlickSlider(variantValue)
  })

  let slickSliderHeight = $(".left_productshop .product_for .slick-list:first").height()
  $(".left_productshop .product_for .slick-list").css("min-height", slickSliderHeight + "px")

  function fixSlickSlider(id){
    if($(window).width() > 1023){
      $(".left_productshop[data-variantid=" + id + "] .slick-slider").slick('slickGoTo', 1, true)
      $(".left_productshop[data-variantid=" + id + "] .slick-slider").slick('slickPrev')
    } else {
      $(".left_productshop[data-variantid=" + id + "] .slick-slider").slick('slickGoTo', 0, true)
    }
  }

});
