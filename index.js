const fs = require('fs');
const path = require('path');
const glob = require('glob');
const randomstring = require('randomstring');


const options = {
    source: './files/**/*.+(txt)',
    filters: {
        minBytes: 0,
        maxBytes: null
    },
    target: './target/',
    check: './check/'
}

const globOptions = {
    nodir: true
};


function clearDir(dir) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => fs.unlinkSync(path.join(dir, file)));
    } else {
        fs.mkdirSync(dir);
    }
}

clearDir(options.target);
clearDir(options.check);

// recursively get the files from the source folder and move them to the target directory
glob(options.source, globOptions, (err, files) => {
    files.forEach((file) => {
        const fileName = path.basename(file);
        const targetFile = options.target + fileName;
        let fileAlreadyExists = false;
        let moveFile = true;

        // check if the target directory already contains a file with the same name
        if (fs.existsSync(targetFile)) {
            fileAlreadyExists = true;
            moveFile = false;
        }


        // if file was already existing in the target, make only keep the one with the biggest filesize
        if (fileAlreadyExists) {
            const newFileSize = fs.statSync(file).size;
            const targetFileSize = fs.statSync(targetFile).size;

            if (newFileSize !== targetFileSize) {
                moveFile = newFileSize > targetFileSize;

                const newFileName = path.parse(fileName);

                fs.copyFileSync(targetFile, path.join(options.check, `${newFileName.name}-${randomstring.generate(8)}${newFileName.ext}`));
                fs.copyFileSync(file, path.join(options.check, `${newFileName.name}-${randomstring.generate(8)}${newFileName.ext}`));
            }
        }

        if (moveFile) {
            fs.copyFileSync(file, targetFile);
        }
    });
});