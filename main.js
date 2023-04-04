function getStartDateInputs() {
  let startDate = document.getElementById('startDate').value; 
  let startDateObject = moment.utc(startDate,'YYYY-MM-DD');
  return { startDateObject, startDate };
}

function getAdoptDateInputs() {
  let adoptDateObject = moment.utc(document.getElementById('adoptionDate').value, 'YYYY-MM-DD');
  let adoptDate = adoptDateObject.format('YYYY MM DD');
  return { adoptDateObject, adoptDate };
}

function getEndDateInputs() {
  let { startDate } = getStartDateInputs();
  let termLength = document.getElementById('termLength').value;
  termLength = parseInt(termLength);
  let endDateObject;
  if (document.getElementById('endDate').value) {
    endDate = document.getElementById('endDate').value;
    endDateObject = moment.utc(endDate, 'YYYY-MM-DD');
  } else {
    endDateObject = moment.utc(startDate);
    endDateObject.add(termLength, 'months').subtract(1, 'day');
  } 
  endDate = endDateObject.format('YYYY MM DD');
  return { endDateObject, endDate }
}

function formatEndDate() {
  let { endDate } = getEndDateInputs();
  let endDateObject = moment.utc(endDate, 'YYYY-MM-DD');
  return endDateObject.format('MMMM D, YYYY');
}

function calculateMonthsTerm() {
  let { startDate } = getStartDateInputs();
  let { endDate } = getEndDateInputs();
  let startDateObject = moment.utc(startDate);
  let endDateObject = moment.utc(endDate, 'YYYY-MM-DD');
  let monthsLengthInitialTerm = endDateObject.diff(startDateObject, 'months') + 1;
  return monthsLengthInitialTerm;
}

function calculateMonthsFromAdoption() {
  let { adoptDate } = getAdoptDateInputs();
  let { endDate } = getEndDateInputs();
  let monthsSinceAdoption;
  let adoptDateObject = moment.utc(adoptDate, 'YYYY-MM-DD');
  let endDateObject = moment.utc(endDate, 'YYYY-MM-DD');
  monthsSinceAdoption = endDateObject.diff(adoptDateObject, 'months') + 1;
  return monthsSinceAdoption;
}

function calculateNumberPayments() {
  let { startDate } = getStartDateInputs();
  let startDateObject = moment.utc(startDate);
  let numberOfPayments = calculateMonthsFromAdoption();
  let paymentDayOfMonth = startDateObject.date();
  if (paymentDayOfMonth > 1) {
    return numberOfPayments - 1;
  } else {
    return numberOfPayments;
  }
}

function calculateLastPayment() {
  let { startDate } = getStartDateInputs();
  let { endDate } = getEndDateInputs();
  let startDateObject = moment.utc(startDate);
  let endDateObject = moment.utc(endDate, 'YYYY-MM-DD');
  let endMonth = endDateObject.month();
  let lastPaymentDate = moment.utc(endDate, 'YYYY-MM-DD');
  if (startDateObject.date() > 1) {
    lastPaymentDate.month(endMonth - 1).date(startDateObject.date());
  } else {
    lastPaymentDate.month(endMonth).date(1);
  }
  return lastPaymentDate.format('MMMM D, YYYY');
}

let buttonPress = document.getElementById('btn');
addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    calculateKeyTerms();
  }
});

function isEndDateBeforeStart() { 
  let { endDateObject } = getEndDateInputs();
  let { startDateObject } = getStartDateInputs();
  return (document.getElementById('endDate').value && moment(endDateObject).isSameOrBefore(startDateObject)) ? true : false;
}

function isEndDateBeforeAdopt() { 
  let { endDateObject } = getEndDateInputs();
  let { adoptDateObject } = getAdoptDateInputs();
  return (moment(endDateObject).isSameOrBefore(adoptDateObject)) ? true : false;
}

function hasRequiredInputs() { // if start date and end date or term length are not filled out
  return (document.getElementById('startDate').value && (document.getElementById('endDate').value || document.getElementById('termLength').value)) ? true : false;
}

function isStartDateBeforeAdoption() { // if lease start date is before adoption date, show last two lines of output 
  let { adoptDateObject } = getAdoptDateInputs();
  let { startDateObject } = getStartDateInputs();
  return (moment(startDateObject).isBefore(adoptDateObject)) ? true : false;
}

function populateInnerHTML() {
  document.getElementById('errorMessage').innerHTML = null;
  document.getElementById('endDateOutput').innerHTML = formatEndDate();
  document.getElementById('endDateOutputLabel').innerHTML = 'Lease end date';
  document.getElementById('lastPmtOutput').innerHTML = calculateLastPayment();
  document.getElementById('lastPmtOutputLabel').innerHTML = 'Likely final payment date';
  document.getElementById('totalMonthsOutput').innerHTML = calculateMonthsTerm();
  document.getElementById('totalMonthsOutputLabel').innerHTML = 'Months with lease expense';
  if (isStartDateBeforeAdoption()) { 
    populatePostAdoptInnerHTML(); // if lease start date is before adoption date populate last two lines of output 
  } else {
    nullPostAdoptInnerHTML(); // if lease start date is NOT before adoption date, clear last two lines of output 
  }
}

function nullInnerHTML() {
  document.getElementById('monthsPostAdopt').innerHTML = null;
  document.getElementById('numberPayments').innerHTML = null;
  document.getElementById('monthsPostAdoptLabel').innerHTML = null;
  document.getElementById('numberPaymentsLabel').innerHTML = null;
  document.getElementById('totalMonthsOutput').innerHTML = null;
  document.getElementById('totalMonthsOutputLabel').innerHTML = null;
  document.getElementById('endDateOutput').innerHTML = null;
  document.getElementById('endDateOutputLabel').innerHTML = null;
  document.getElementById('lastPmtOutput').innerHTML = null;
  document.getElementById('lastPmtOutputLabel').innerHTML = null;
}

function populatePostAdoptInnerHTML() {
  document.getElementById('monthsPostAdopt').innerHTML = calculateMonthsFromAdoption();
  document.getElementById('monthsPostAdoptLabel').innerHTML = 'Post-adoption remaining term (months)';
  document.getElementById('numberPayments').innerHTML = calculateNumberPayments();
  document.getElementById('numberPaymentsLabel').innerHTML = 'Post-adoption payments made';
}

function nullPostAdoptInnerHTML() {
  document.getElementById('monthsPostAdopt').innerHTML = null;
  document.getElementById('monthsPostAdoptLabel').innerHTML = null;
  document.getElementById('numberPayments').innerHTML = null;
  document.getElementById('numberPaymentsLabel').innerHTML = null;
}

function calculateKeyTerms() {
  if (hasRequiredInputs()) {
    if (isEndDateBeforeStart()) {
      document.getElementById('errorMessage').innerHTML = 'Error: lease end date must be after start date';
      nullInnerHTML();
    } else if (isEndDateBeforeAdopt()) {
      document.getElementById('errorMessage').innerHTML = 'Error: lease ends before adoption date and may not be in scope of ASC 842';
      nullInnerHTML();
    } else { // if all needed terms are entered and end date is NOT before start date, display core outputs
      populateInnerHTML();
    }
  } else {  // if not all required inputs are entered, present error and null output fields
    document.getElementById('errorMessage').innerHTML = 'Please enter a valid start date and end date or term length';
    nullInnerHTML();
  } 
}
