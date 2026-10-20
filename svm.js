
var water1 = 
    /* color: #00ffff */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.03936255172254, -0.3379596724466363],
          [34.03936255172254, -0.36817150082680306],
          [34.068201663050665, -0.36817150082680306],
          [34.068201663050665, -0.3379596724466363]]], null, false),
    water2 = 
    /* color: #bf04c2 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.35980633812098, -0.40192014567315454],
          [34.35980633812098, -0.413077852954263],
          [34.37353924827723, -0.413077852954263],
          [34.37353924827723, -0.40192014567315454]]], null, false),
    water3 = 
    /* color: #ff0000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.171433858454165, -0.29783129765197347],
          [34.171433858454165, -0.3143105546506972],
          [34.193406514704165, -0.3143105546506972],
          [34.193406514704165, -0.29783129765197347]]], null, false),
    water4 = 
    /* color: #00ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.10093898498282, -0.43259464744609094],
          [34.10093898498282, -0.4509618687077178],
          [34.122482487790435, -0.4509618687077178],
          [34.122482487790435, -0.43259464744609094]]], null, false),
    water5 = 
    /* color: #0000ff */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[33.98111455532694, -0.395613644435295],
          [33.98111455532694, -0.4189590016996173],
          [34.00308721157694, -0.4189590016996173],
          [34.00308721157694, -0.395613644435295]]], null, false),
    water6 = 
    /* color: #999900 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.273843039418026, -0.4097603043359471],
          [34.273843039418026, -0.4311315702225707],
          [34.30053638353424, -0.4311315702225707],
          [34.30053638353424, -0.4097603043359471]]], null, false),
    nonwater1 = 
    /* color: #009999 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.20897977841029, -0.4837169556117702],
          [34.20897977841029, -0.5153014482446807],
          [34.24468534481654, -0.5153014482446807],
          [34.24468534481654, -0.4837169556117702]]], null, false),
    ROI = 
    /* color: #ff9999 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[33.95893665888134, -0.2804215586045142],
          [33.95893665888134, -0.5543855850995356],
          [34.40594288446728, -0.5543855850995356],
          [34.40594288446728, -0.2804215586045142]]], null, false),
    nonwater2 = 
    /* color: #99ff99 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.16218372919384, -0.40195563584496113],
          [34.16218372919384, -0.41843470564968366],
          [34.18072315790478, -0.41843470564968366],
          [34.18072315790478, -0.40195563584496113]]], null, false),
    nonwater3 = 
    /* color: #9999ff */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.00150868036572, -0.4458997443972362],
          [34.00150868036572, -0.47748441189918045],
          [34.04339405634228, -0.47748441189918045],
          [34.04339405634228, -0.4458997443972362]]], null, false),
    nonwater4 = 
    /* color: #ffff99 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.28852650263134, -0.2982741140840805],
          [34.28852650263134, -0.3291726983675468],
          [34.33796497919384, -0.3291726983675468],
          [34.33796497919384, -0.2982741140840805]]], null, false),
    nonwater5 = 
    /* color: #99ffff */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.267240491889154, -0.48366400408718335],
          [34.267240491889154, -0.4994562695032257],
          [34.28509327509228, -0.4994562695032257],
          [34.28509327509228, -0.48366400408718335]]], null, false),
    nonwater6 = 
    /* color: #ff99ff */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[34.124624971668226, -0.41920217576723423],
          [34.124624971668226, -0.42409439253177345],
          [34.13028979710768, -0.42409439253177345],
          [34.13028979710768, -0.41920217576723423]]], null, false),
    L8_SR_coll = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2");


    
// Landsat-8 Surface Reflectance Tier 1 Collection 2
// https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC08_C02_T1_L2


// Filter the collection by period
//                       by location
//                       by cloud cover property
var L8_SR_filtered_coll = L8_SR_coll.filterDate('2019-01-01', '2019-12-31')
                       .filterBounds(ROI)
                       .filter(ee.Filter.lt('CLOUD_COVER',50));

print('number of images in L8 filtered collection');
print(L8_SR_filtered_coll.size());

// Function that applies radiometric scaling factors
function applyRadiometricScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

// Function that applies cloud masking
function cloud_maskL8sr(image) {
  // Bits 3 and 4 are cloud shadow and cloud, respectively
  var cloudShadowBitMask = 1 << 3;
  var cloudsBitMask = 1 << 4;
  // Get the pixel QA band.
  var qa = image.select('QA_PIXEL');
  // Both flags should be set to zero, indicating clear conditions
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  // Return the masked image without the QA bands
  return image.updateMask(mask);
}

// Applying radiometric scaling factors and cloud masking
L8_SR_filtered_coll = L8_SR_filtered_coll.map(applyRadiometricScaleFactors).map(cloud_maskL8sr);

// Check the effectiveness of the cloud masking 
// on the first image of the filtered collection
Map.addLayer(L8_SR_filtered_coll.first(), {bands: ['SR_B4', 'SR_B3', 'SR_B2'], min:0, max: 0.3},'L8 first image 2018 (RGB)', false);

// Computing the aggregated image
var L8_SR_median_image = L8_SR_filtered_coll.median();
print('L8_SR_median_image');
print(L8_SR_median_image);

// Display the aggregated image (input for the classifier)
Map.addLayer(L8_SR_median_image, {bands: ['SR_B4', 'SR_B3', 'SR_B2'], min:0,max: 0.3},'L8 median image 2018 (RGB)');
//Map.setCenter(-62.836, -9.2399, 9);



// Manually created polygons for training the classifier
// They can be directly drawn form the GUI

// Make a FeatureCollection from the hand-made geometries
var polygons = ee.FeatureCollection([
  ee.Feature(water1, {'class': 0}),
  ee.Feature(water2, {'class': 0}),
  ee.Feature(water3, {'class': 0}),
  ee.Feature(water4, {'class': 0}),
  ee.Feature(water5, {'class': 0}),
  ee.Feature(water6, {'class': 0}),
  ee.Feature(nonwater1,    {'class': 1}),
  ee.Feature(nonwater2,    {'class': 1}),
  ee.Feature(nonwater3,    {'class': 1}),
  ee.Feature(nonwater4,    {'class': 1}),
  ee.Feature(nonwater5,    {'class': 1}),
  ee.Feature(nonwater6,    {'class': 1})
]);
print('polygons', polygons);

// Display the training polygons
Map.addLayer(polygons, {}, 'training polygons');

// Create the trining dataset
// Getting the values for all pixels in each polygon 
var training_data = L8_SR_median_image.sampleRegions({
  // Get the sample from the polygons FeatureCollection
  collection: polygons,
  // Keep this list of properties from the polygons
  properties: ['class'],
  // Set the scale (spatial resolution) to get Landsat pixels in the polygons (m)
  scale: 30
});

print('training_data size');
print(training_data.size());

print('training_data first 50');
print(training_data.limit(50));

// Create an SVM classifier with custom parameters
var classifier = ee.Classifier.libsvm({
  kernelType: 'RBF',
  gamma: 0.5,
  cost: 10
});

// Bands to be used for the prediction
var bands = ['SR_B3', 'SR_B5', 'SR_B6', 'SR_B7'];

// Train the classifier
var trained_classifier = classifier.train(training_data, 'class', bands);

// Get information about the trained classifier
print('Trained classifier', trained_classifier.explain());

// Classify the L8 SR median image (inference)
var classified_L8_SR_median_image = L8_SR_median_image.classify(trained_classifier);

print('classified_L8_SR_median_image');
print(classified_L8_SR_median_image);

// Display the classification results
Map.addLayer(classified_L8_SR_median_image, {min: 0, max: 1, palette: ['blue', 'green']}, 'classified_L8_SR_median_image (water vs. non-water)');