const Jimp = require('jimp');
const path = require('path');

async function generateImage(template, company, message, contact) {
  const templatePath = path.join(__dirname, '../templates', template);

  try {
    // Load the template image
    const image = await Jimp.read(templatePath);

    // Load a font
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // Add text to the image
    image.print(font, 10, 10, message, 500);
    image.print(font, 10, 200, company, 500);
    image.print(font, 10, 260, contact, 500);

    // Generate a unique output file name
    const outputName = `${Date.now()}_${template}`;
    const outputPath = path.join(__dirname, '../output', outputName);

    // Save the image
    await image.writeAsync(outputPath);

    return outputName; // Return the generated file name
  } catch (err) {
    console.error('Error generating image:', err);
    throw new Error('Failed to generate image');
  }
}

module.exports = generateImage;