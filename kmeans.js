
var ROI = 
    /* color: #ffc82d */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[138.4674723036692, 35.54681958503143],
          [138.4674723036692, 35.03343656422262],
          [139.3134195692942, 35.03343656422262],
          [139.3134195692942, 35.54681958503143]]], null, false),
    L7_SR_coll = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2");

    // Landsat-7 Surface Reflectance Tier 1 Collection 2
// https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LE07_C02_T1_L2#description

// Filter the collection by period
// by location
// and by cloud cover property
var L7_SR_filtered_coll = L7_SR_coll.filterDate('2002-01-01', '2002-12-31')
                  .filterBounds(ROI)
                  .filter(ee.Filter.lt('CLOUD_COVER',50));
print('number of images in L7 filtered collection');
print(L7_SR_filtered_coll.size());

// Function that applies radiometric scaling factors
function applyRadiometricScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);

  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}


// Function that applies cloud masking
function cloud_maskL7sr(image) {
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
L7_SR_filtered_coll = L7_SR_filtered_coll.map(applyRadiometricScaleFactors).map(cloud_maskL7sr);

// Check the effectiveness of the cloud masking 
// on the first image of the filtered collection
Map.addLayer(L7_SR_filtered_coll.first(), {bands: ['SR_B4', 'SR_B3', 'SR_B2'], min:0,max: 0.3},'L7 SR first image 2001', false);

// Computing the aggregated image and selecting the bands of interest
var L7_SR_median_image = L7_SR_filtered_coll.median().select(['SR_B1', 'SR_B2','SR_B3','SR_B4','SR_B5', 'SR_B7', 'ST_B6']);
print('L7_SR_median_image');
print(L7_SR_median_image);

// Display the aggregated image (input for the clusterer)
Map.addLayer(L7_SR_median_image, {'bands': ['SR_B3', 'SR_B2', 'SR_B1'], 'min':0, 'max':0.3}, 'Landsat-7 SR 2001 median image (RGB)');
Map.centerObject(ROI);

// Make the training dataset within the ROI
// We generate a sample of the input landsat 7 median image
var training_data = L7_SR_median_image.sample({
  region: ROI,
  scale: 30,
  numPixels: 5000,
  geometries: true
});

print('training_data');
print(training_data);

Map.addLayer(training_data, {color: 'black'}, 'training_data', false);

// Instantiate the clusterer
var number_of_clusters = 7;
var clusterer = ee.Clusterer.wekaKMeans(number_of_clusters);

// Train the clusterer
var trained_clusterer = clusterer.train(training_data);

// Cluster the input using the trained clusterer (inference)
var clustered_L7_SR_median_image = L7_SR_median_image
                                   .cluster(trained_clusterer);
                                   
print('clustered_L7_SR_median_image');
print(clustered_L7_SR_median_image);

// Display the clusters with a custom palette
Map.addLayer(clustered_L7_SR_median_image, 
            {palette:['red', 'yellow', 'blue', 'green', 'black', 'orange', 'purple'], min:0, max:6}, 'clustered_L7_SR_median_image');

// 3: 'red', 'yellow', 'blue'
// 5: 'red', 'yellow', 'blue', 'green', 'black'
// 7: 'red', 'yellow', 'blue', 'green', 'black', 'orange', 'purple'