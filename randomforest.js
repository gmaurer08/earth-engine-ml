var ROI = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[4.363755612418161, 43.60494545625886],
          [4.363755612418161, 43.33885028391176],
          [4.752396969840036, 43.33885028391176],
          [4.752396969840036, 43.60494545625886]]], null, false);

// Sentinel-2 SR (HARMONIZED)
// https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED
var S2_SR_coll = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");

// Filter the collection by period
//                       by location
//                       by cloud cover property
var S2_SR_coll_filtered = S2_SR_coll.filterDate('2019-01-01', '2019-12-31')
                                    .filterBounds(ROI)
                                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',50));
print('number of images in S2 filtered collection');
print(S2_SR_coll_filtered.size());

// Function to mask clouds using the Sentinel-2 QA band
// and to apply the radiometric scaling factor
// @param  {ee.Image} image Sentinel-2 image
// @return {ee.Image} cloud masked and radiometrically scaled
//          Sentinel-2 image
function maskS2clouds_and_radiometricScaling(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
 // Masking cloud pixels        Applying radiometric scaling factor
 //            |                          |
 //            V                          |
 // making the pixels covered             |
 // by clouds transparent                 |
 // (ignored by reducers)                 |
 //            |                          |
 //            V                          V
  return image.updateMask(mask).multiply(0.0001);
}                  

// Applying radiometric scaling factors and standard cloud masking (QA60 band)               
var S2_SR_coll_filtered_cloud_masked = S2_SR_coll_filtered.map(maskS2clouds_and_radiometricScaling);  

// Check the effectiveness of the standard cloud masking 
// on the first image of the filtered collection
//                                                              R->R  G->G   B->B
Map.addLayer(S2_SR_coll_filtered_cloud_masked.first(), {bands: ['B4', 'B3',  'B2'], min:0,max: 0.3},'S2 first image 2021 R-G-B (true color composite, standard masking)', false);



// Cloud Score+ image collection. Note Cloud Score+ is produced from Sentinel-2
// Level 1C data and can be applied to either L1C or L2A collections
var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');

// Use 'cs' or 'cs_cdf', depending on your use case; see docs for guidance
var QA_BAND = 'cs_cdf';

// The threshold for masking; values between 0.50 and 0.65 generally work well.
// Higher values will remove thin clouds, haze & cirrus shadows
var CLEAR_THRESHOLD = 0.60;

// Function to mask clouds using the Cloud Score+ cloud masking
// and to apply the radiometric scaling factor
function  cloud_score_plus_maskS2clouds_and_radiometricScaling(img) {
  //           Masking cloud pixels                      Applying radiometric scaling factor
  //                 |                                                       |
  //                 V                                                       |
  //            making the pixels covered                                    |
  //            by clouds transparent                                        |
  //           (ignored by reducers)                                         V
      return img.updateMask(img.select(QA_BAND).gte(CLEAR_THRESHOLD)).multiply(0.0001);
    }
                  

// Applying radiometric scaling factors and Cloud Score+ cloud masking  
var S2_SR_coll_filtered_cloud_masked = S2_SR_coll_filtered.linkCollection(csPlus, [QA_BAND])
                                            .map(cloud_score_plus_maskS2clouds_and_radiometricScaling);

// Check the effectiveness of the Cloud Score+ cloud masking 
// on the first image of the filtered collection
//                                                             R->R   G->G   B->B
Map.addLayer(S2_SR_coll_filtered_cloud_masked.first(), {bands: ['B4', 'B3',  'B2'], min:0,max: 0.3},'S2 first image 2021 R-G-B (true color composite, Cloud Score+ masking)', false);


// Computing the temporally aggregated image (median)
var S2_SR_aggregated_image = S2_SR_coll_filtered_cloud_masked.median();

//                                           R->R   G->G  B->B
Map.addLayer(S2_SR_aggregated_image, {bands:['B4', 'B3',  'B2'], min:0, max:0.3}, 'aggregated_image R-G-B (true color composite)');

//                                          R->SWIR1  G->NIR  B->G
Map.addLayer(S2_SR_aggregated_image, {bands: ['B11',  'B8',    'B3'], min: 0, max: 0.3}, 'aggregated_image SWIR1-NIR-G (false color composite)');              


// The European Space Agency (ESA) WorldCover 10 m 2021 product provides a global land cover map 
// for 2021 at 10 m resolution based on Sentinel-1 and Sentinel-2 data
// We will use it as label source in classifier training
var ESA_world_LCs = ee.ImageCollection("ESA/WorldCover/v200");
var ESA_2021_LC = ESA_world_LCs.first();

print('ESA 2021 WorldCover land cover map');
print(ESA_2021_LC);

// Remap the 11 land cover class values to a 0-based sequential series
var classValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100];
var remapValues = ee.List.sequence(0, 10);
var label = 'lc';
ESA_2021_LC = ESA_2021_LC.remap(classValues, remapValues).rename(label).toByte();

// Defining the color palette for the LC classes
var LC_palette = ['006400',  // 0   Tree cover
                  'ffbb22',  // 1   Shrubland
                  'ffff4c',  // 2   Grassland
                  'f096ff',  // 3   Cropland
                  'fa0000',  // 4   Built-up
                  'b4b4b4',  // 5   Bare / sparse vegetation
                  'f0f0f0',  // 6   Snow and ice
                  '0064c8',  // 7   Permanent water bodies
                  '0096a0',  // 8   Herbaceous wetland
                  '00cf75',  // 9   Mangroves
                  'fae6a0']; // 10  Moss and lichen


Map.addLayer(ESA_2021_LC, {min:0,max:10, palette:LC_palette}, 'ESA_2021_LC (10 m spatial resolution)');


// Add land cover as a band of the aggregated image and sample 100 pixels at
// 10 m scale from each land cover class within the region of interest
// Stratified sampling—where one samples specific proportions of individuals 
// from various subpopulations (strata) in the larger population—is meant 
// to ensure that the subjects selected will be representative of the population of interest
var datasetSample = S2_SR_aggregated_image.addBands(ESA_2021_LC).stratifiedSample({
  numPoints: 250,
  classBand: label,
  region: ROI,
  scale: 10,
  geometries: true,
  tileScale:4
});

print('datasetSample size',datasetSample.size());
print('datasetSample frequency');
print(datasetSample.reduceColumns(ee.Reducer.frequencyHistogram(),['lc']));
print('datasetSample first 100 values',datasetSample.limit(100));

// Add a random value field to the sample and use it to approximately split 80%
// of the features into a training set and 20% into a validation set
datasetSample = datasetSample.randomColumn();
print('datasetSample first 100 values',datasetSample.limit(100));
var trainingSample = datasetSample.filter('random <= 0.8');
var validationSample = datasetSample.filter('random > 0.8');

print('trainingSample size',trainingSample.size());
print('trainingSample frequency');
print(trainingSample.reduceColumns(ee.Reducer.frequencyHistogram(),['lc']));
print('trainingSample first 100 values',trainingSample.limit(100));

print('validationSample size',validationSample.size());
print('validationSample frequency');
print(validationSample.reduceColumns(ee.Reducer.frequencyHistogram(),['lc']));
print('validationSample first 100 values',validationSample.limit(100));

Map.addLayer(trainingSample, {color: 'black'}, 'Training sample', false);
Map.addLayer(validationSample, {color: 'white'}, 'Validation sample', false);

var RF_classifier =   ee.Classifier.smileRandomForest(50);
// Train a 10-tree random forest classifier from the training sample
var trainedRFClassifier =RF_classifier.train({
  features: trainingSample,
  classProperty: label,
  inputProperties: S2_SR_aggregated_image.bandNames()
});

// Get information about the trained classifier.
print('Results of trained classifier', trainedRFClassifier.explain());

// Get a confusion matrix and overall accuracy for the training sample
var trainAccuracy = trainedRFClassifier.confusionMatrix();
print('Training error matrix', trainAccuracy);
print('Training overall accuracy', trainAccuracy.accuracy());

// Get a confusion matrix and overall accuracy for the validation sample
validationSample = validationSample.classify(trainedRFClassifier);
var validationAccuracy = validationSample.errorMatrix(label, 'classification');
print('Validation error matrix', validationAccuracy);
print('Validation accuracy', validationAccuracy.accuracy());

// Classify the aggregated image with the trained classifier
var classified_S2_SR_aggregated_image = S2_SR_aggregated_image.classify(trainedRFClassifier);

// Map.setCenter(-122.184, 37.796, 12);
Map.addLayer(classified_S2_SR_aggregated_image, {min:0,max:10, palette:LC_palette}, '2023 classified_S2_SR_aggregated_image');