// client-side js
// run by the browser each time your view template is loaded
/* global marked */

function flipCard(cardBack) {
  // Given the back of the card, replace the empty body div with the filled div
  //$("#cardback").show();
  $("#cardback").css('visibility','visible')
}

function drawNewCard(data){
  // Don't need to reload anything JSON-wise since it's all already loaded
  // into memory. So just clear and show a new one
  drawCard(data);
}

function drawCard(data) {
  var $dataContainer = $("#data-container");

  if (data.error) {
    $dataContainer.html("Error! " + data.error);
    return;
  }

  // Clear the loading message.
  $dataContainer.html("");

  /////////////
  // FILTERS
  /////////////
  
  var $filtersDiv = $('<div class="row justify-content-center mx-auto w-100" />');
  var $filtersCol = $(
    '<div class="col d-inline-flex justify-content-center" />'
  );
  var $filtersForm = $('<form class="d-flex justify-content-center ml-0" />');
  var types = {
    People: ["person", false],
    Groups: ["group", true],
    Events: ["event", false],
    Regimes: ["regime", false],
    Years: ["year", false]
  };
  var checkboxDivs = [];
  Object.keys(types).forEach(function(cardType) {
    var typeInfo = types[cardType];
    var cardClass = typeInfo[0];
    var defaultChecked = typeInfo[1];
    var checkboxID = "cb-" + cardClass;
    var $checkboxDiv = $(
      '<div class="form-check form-check-inline align-top" />'
    );
    var $checkboxInput = $('<input class="form-check-input" type="checkbox" />')
      .attr("id", checkboxID)
      .attr("value", cardClass)
      .prop("checked", defaultChecked);
    // I think for some reason you're supposed to put the label inside a span...
    var $labelSpan = $('<span class="align-middle" />');
    var $checkboxLabel = $('<label class="form-check-label" />')
      .attr("for", checkboxID)
      .text(cardType);
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
  $filtersCol.append($filtersForm);
  // Finished populating filtersCol, add it to filtersDiv
  $filtersDiv.append($filtersCol);
  // Add aboveContentDiv to the layout grid now that we're done
  $dataContainer.append($filtersDiv);

  //////////
  // CARD
  //////////
  
  var $cardsDiv = $('<div class="row justify-content-center mx-auto w-100" />');
  // For viewall we did data.records.forEach(), but here we just want to draw one randomly
  // Except we want one of the checked guys
  var activeRecords = data.records.filter(record => record.type == "Group");
  const record = activeRecords[Math.floor(Math.random() * activeRecords.length)];
  var cardClass = record.type.toLowerCase();
  // But we want to skip any records with types that are not checked
  var checkboxID = "#cb-" + record.type.toLowerCase();
  //if (!$(checkboxID).is(':checked')){
  //  console.log(checkboxID);
  //  return;
  //}
  var $cardDiv = $('<div class="card full-card mx-auto" />').addClass(cardClass).attr('id','card');
  // Two divs: header and body
  var $cardFrontDiv = $('<div class="card-front card-header" />').attr('id', 'cardfront');
  var $cardBackDiv = $('<div class="card-back card-body" />').attr('id','cardback');

  // Header is just the entity name and badge
  var $cardTitle = $(
    '<h5 class="card-title font-weight-bold d-inline-block mb-0" />'
  ).text(record.name);
  $cardFrontDiv.append($cardTitle);
  var recordType = record.type;
  var recordClass = "label-ent-" + record.type.toLowerCase();
  var $cardTypeSpan = $(
    '<span class="label label-as-badge mb-0 pb-0 float-right primary" />'
  )
    .text(recordType)
    .addClass(recordClass);
  $cardFrontDiv.append($cardTypeSpan);

  // Now construct the body
  // The subtitle which is the short description
  var $cardSubtitle = $('<h5 class="card-title mb-0" />').html(
    marked(record.full_name || record.desc || "")
  );
  $cardBackDiv.append($cardSubtitle);
  // Main text: the notes
  var $cardText = $('<p class="card-text" />').html(marked(record.notes || ""));
  $cardBackDiv.append($cardText);
  
  // Hide the back of the card before appending(?)
  // This removes the div from the page
  //$cardBackDiv.hide();
  // This just makes it invisible
  $cardBackDiv.css('visibility','hidden');

  // Construct the card
  $cardDiv.append($cardFrontDiv);
  // But here, unlike in viewall, we append an *empty* body at first (until they click Flip)
  $cardDiv.append($cardBackDiv);
  $cardsDiv.append($cardDiv);
  //var $defn = $.text(record.stands_for);
  //var $defn = "testing";
  //$galleryCard.append($defn);
  // Finished populating cardsDiv, so add it to layoutGridDiv
  $dataContainer.append($cardsDiv);
  
  ///////////
  // BUTTONS
  ///////////
  
  // Div to make a new row below the card
  var $bottomDiv = $(
    //'<div class="form-check form-check-inline align-top" />'
    '<div class="row justify-content-center mx-auto w-100" />'
  );
  
  var $buttonsDiv = $('<div class="form-check form-check-inline align-top" />')
  
  // Button to flip the card
  var $flipButton = $('<button class="mr-1">').text("Flip").prop('disabled',false).click(function(){
    flipCard();
    $(this).prop('disabled',true).addClass('disabled');
  }).removeClass('disabled');
  $buttonsDiv.append($flipButton);
  // Button to go to next card
  var $nextButton = $('<button>').text("Next Card").click(function(){
    drawNewCard(data);
  });
  $buttonsDiv.append($nextButton);
  $bottomDiv.append($buttonsDiv);
  $dataContainer.append($bottomDiv);
  // Awkwardly, we now have to trigger "change" on the checkboxes to show/hide based on defaults
  $("input").trigger("change");
}

function redrawCard() {
  $.getJSON("/data", drawCard);
}

$(function() {
  $.getJSON("/data", drawCard);
});
