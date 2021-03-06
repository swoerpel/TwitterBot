'use strict';
var MasterController = require('../../ant_scripts/MasterController.js');
var chroma = require('chroma-js');
var tome = require('chromotome');
var fs = require('fs')

exports.generate_composite_image = function (req, res) {
    console.log('generating composite')


    let paths = {
        LayerImages: 'C:\\Files\\Programming\\AnyColonyImageGenerator\\api\\controllers\\LayerImages.py',
        individual: 'C:\\Files\\Programming\\AnyColonyImageGenerator\\images\\individual\\',
        combined: 'C:\\Files\\Programming\\AnyColonyImageGenerator\\images\\combined\\',
        masks: 'C:\\Files\\Programming\\AnyColonyImageGenerator\\images\\masks\\'
    }

    let id = Math.round(Math.random() * 100000).toString();
    let mask_name = 'mask_' + id
    let image_A_name = 'imA_' + id
    let image_B_name = 'imB_' + id
    let composite_name = 'comp_' + id

    GenerateImage(paths.masks, mask_name);
    GenerateImage(paths.individual, image_A_name);
    GenerateImage(paths.individual, image_B_name);


    let subprocessA = runScript(paths, composite_name);
    subprocessA.stdout.on('data', (data) => {
        console.log(`data:${data}`);
    });
    subprocessA.stderr.on('data', (data) => {
        console.log(`error:${data}`);
    });
    subprocessA.stderr.on('close', () => {
        console.log("Closed");
    });

    res.status(200).send({
        message: 'Image Generated',
        code: 200
    })

}

function runScript(paths, composite_name) {
    const { spawn } = require('child_process')
    return spawn('python', [
        "-u",
        paths.LayerImages,
        paths.individual,
        paths.combined,
        paths.masks,
        composite_name
    ]);
}


function AddToB64Log(B64_image) {
    console.log('working directory', __dirname);
    let absolute_path = "/app/b64log.json"
    fs.readFile('b64log.json', (err, data) => {
        var json = JSON.parse(data)
        json.push(B64_image)
        fs.writeFile("b64log.json", JSON.stringify(json), () => { })
    })
}

function GetStrokeWeights(rand_shape) {
    if (rand_shape == 0) {
        return {
            stroke_weights: [2, 1, .9, .8, .7, .6, .5],
            sub_shapes: [1, 2, 4],
            sub_stroke_weights: [1, .5]
        }
    }
    if (rand_shape == 1) {
        return {
            stroke_weights: [1, .9, .8, .7, .6, .5],
            sub_shapes: [1, 2, 4],
            sub_stroke_weights: [1, .5]
        }
    }
    if (rand_shape == 2) {
        return {
            stroke_weights: [2, 1, .5],
            sub_shapes: [1, 2, 4],
            sub_stroke_weights: [1, .5]
        }
    }
    if (rand_shape == 3) {
        return {
            stroke_weights: [3, 2, 1, .5],
            sub_shapes: [1, 2],
            sub_stroke_weights: [1, .5]
        }
    }
}

function GenerateImage(path, image_id) {
    let possible_rotations = [0, 90, 180];
    // let palettes = Object.keys(chroma.brewer)
    // let palettes = tome.getRandom();
    // console.log(tome.getAll())
    let palettes = tome.getAll();
    // let palettes = tome.get('hilda02');

    let rand_shape = Math.floor(Math.random() * 4)
    let step_path = Math.floor(Math.random() * 3)
    let color_path = Math.floor(Math.random() * 3)
    let rand_grid = Math.floor(Math.random() * 1)
    let rand_palette = palettes[Math.floor(Math.random() * palettes.length)].colors;
    console.log('rand palette', rand_palette)
    let rotation = possible_rotations[Math.floor(Math.random() * possible_rotations.length)];
    console.log('image -> shape - color - index', rand_shape, rand_palette)
    let sw_params = GetStrokeWeights(rand_shape);
    let params = {
        paths: {
            svg: path,
            png: path,
        },
        // paths: {
        //     svg: path_svg,
        //     png: path_png,
        // },
        step_shape: rand_shape,
        step_path: step_path, // overlap order path
        color_path: color_path, // color sequence path
        grid_scale: { x: 1, y: 1 },
        grid_size: rand_grid,
        palette: rand_palette,
        image_id: image_id,
        stroke_weights: sw_params.stroke_weights,
        rotation: rotation,
        sub_shapes: sw_params.sub_shapes,
        sub_stroke_weights: sw_params.sub_stroke_weights
    }
    generate_image(params);
}

async function generate_image(params) {
    let color_machine = chroma.scale(params.palette)
    let master_controller = new MasterController();
    master_controller.SetPaths(params.paths.svg, params.paths.png);
    master_controller.SetStepShape(params.step_shape);
    master_controller.SetStepPath(params.step_path);
    master_controller.SetColorPath(params.color_path);
    master_controller.SetGridScale(params.grid_scale);
    master_controller.SetGridSize(params.grid_size);
    master_controller.SetImageId(params.image_id);
    master_controller.SetStrokeWeights(params.stroke_weights);
    master_controller.SetRotation(params.rotation);
    master_controller.SetSubShapes(params.sub_shapes);
    master_controller.SetSubStrokeWeights(params.sub_stroke_weights);
    master_controller.GenerateImage(color_machine);
}


