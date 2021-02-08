// client-side js
// run by the browser each time your view template is loaded
/* global marked */

function showHideCards(cardType, checked){
    console.log(cardType + "!!!" + checked);
    var cardSelector = $("."+cardType);
    if (checked){
      cardSelector.show()
    } else {
      cardSelector.hide();
    }
  }
  
  function generateGrid(data) {
      var $dataContainer = $("#data-container");
  
      if (data.error) {
        $dataContainer.html("Error! " + data.error);
        return;
      }
  
      // Clear the loading message.
      $dataContainer.html("");
      
      // Filters row
      var $filtersDiv = $('<div class="row justify-content-center mx-auto w-100" />');
      //var $filtersCol = $('<div class="justify-content-center" />');
      var $filtersForm = $('<form class="d-flex justify-content-center ml-0 mr-0" />');
      var types = {'People':['person',true],
                   'Groups':['group',true],
                   'Events':['event',true],
                   'Regimes':['regime',true],
                   'Years':['year',false]};
      var checkboxDivs = [];
      Object.keys(types).forEach(function(cardType){
        var typeInfo = types[cardType];
        var cardClass = typeInfo[0];
        var defaultChecked = typeInfo[1];
        var checkboxID = 'cb-' + cardClass;
        var $checkboxDiv = $('<div class="form-check form-check-inline align-top" />');
        var $checkboxInput = $('<input class="form-check-input" type="checkbox" />').attr('id',checkboxID).attr('value',cardClass).change(function(){
            showHideCards($(this).attr('value'), this.checked);
        }).prop("checked",defaultChecked);
        // I think for some reason you're supposed to put the label inside a span...
        var $labelSpan = $('<span class="align-middle" />');
        var $checkboxLabel = $('<label class="form-check-label" />').attr('for',checkboxID).text(cardType);
        $checkboxInput.append($checkboxLabel);
        // Add them to the div
        $checkboxDiv.append($checkboxInput);
        $checkboxDiv.append($checkboxLabel);
        // And add the div to the page container
        $filtersForm.append($checkboxDiv);
        checkboxDivs.push($checkboxDiv);
      });
    // The last box needs to have no right-padding...
    checkboxDivs[checkboxDivs.length-1].addClass("mr-0");
      // Finished populating filterForm, add it to $filtersCol
      //$filtersCol.append($filtersForm);
      // Finished populating filtersCol, add it to filtersDiv
      $filtersDiv.append($filtersForm);
      // Add aboveContentDiv to the layout grid now that we're done
      $dataContainer.append($filtersDiv);
  
      // Now a new row for the contents
      var $cardsDiv = $('<div class="row justify-content-center" />');
      data.records.forEach(function(record) {
        var cardClass = record.type.toLowerCase();
        // But we want to skip any records with types that are not checked
        var checkboxID = '#cb-' + record.type.toLowerCase();
        //if (!$(checkboxID).is(':checked')){
        //  console.log(checkboxID);
        //  return;
        //}
        var $galleryCard = $('<div class="card gallery-card" />').addClass(cardClass);
        // Two divs: header and body
        var $cardHeader = $('<div class="card-header" />');
        var $cardBody = $('<div class="card-body" />');
        
        // Header is just the entity name and badge
        var $cardTitle = $('<h5 class="card-title font-weight-bold d-inline-block mb-0" />').text(record.name);
        $cardHeader.append($cardTitle);
        var recordType = record.type;
        var recordClass = "label-ent-" + record.type.toLowerCase();
        var $cardType = $('<span class="label label-as-badge mb-0 pb-0 float-right primary" />').text(recordType).addClass(recordClass);
        $cardHeader.append($cardType);
        
        // Now construct the body
        // The subtitle which is the short description
        var $cardSubtitle = $(
          '<h5 class="card-title mb-0" />'
        ).html(marked(record.full_name || record.desc || ""));
        $cardBody.append($cardSubtitle);
        // Main text: the notes
        var $cardText = $('<p class="card-text" />').html(marked(record.notes || ""));
        $cardBody.append($cardText);
        
        // Construct the card
        $galleryCard.append($cardHeader);
        $galleryCard.append($cardBody);
        //var $defn = $.text(record.stands_for);
        //var $defn = "testing";
        //$galleryCard.append($defn);
        
        $cardsDiv.append($galleryCard);
      });
      // Finished populating cardsDiv, so add it to layoutGridDiv
      $dataContainer.append($cardsDiv);
    // Awkwardly, we now have to trigger "change" on the checkboxes to show/hide based on defaults
    $('input').trigger("change");
  }
  
  function redrawGrid(){
    $.getJSON("/data", generateGrid);
  }
  
  $(function() {
    $.getJSON("/data", generateGrid);
  });
  