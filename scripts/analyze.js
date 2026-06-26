const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'agricultural-crop-management-backend', 'src', 'main', 'java', 'org', 'example', 'QuanLyMuaVu');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.java')) {
            results.push(fullPath);
        }
    });
    return results;
}

const javaFiles = walk(srcDir);

function parseMappingAnnotation(line, annotationName) {
    const match = line.match(new RegExp(`@${annotationName}(?:\\s*\\((.*)\\))?`));
    if (!match) {
        return null;
    }

    const args = match[1];
    if (!args) {
        return '';
    }

    const directPath = args.match(/^\s*"([^"]+)"/);
    if (directPath) {
        return directPath[1];
    }

    const namedPath = args.match(/(?:value|path)\s*=\s*"([^"]+)"/);
    if (namedPath) {
        return namedPath[1];
    }

    return '';
}

const analysis = {
    controllers: [],
    entities: [],
    repositories: [],
    services: [],
    crossModuleDependencies: []
};

// Module names list
const modules = fs.readdirSync(path.join(srcDir, 'module')).filter(f => fs.statSync(path.join(srcDir, 'module', f)).isDirectory());

javaFiles.forEach(filePath => {
    const relativePath = path.relative(srcDir, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract package name
    const pkgMatch = content.match(/package\s+([^;]+);/);
    const pkgName = pkgMatch ? pkgMatch[1] : '';
    
    // Extract module name from package
    let fileModule = 'root';
    if (pkgName.includes('.module.')) {
        const parts = pkgName.split('.module.');
        if (parts[1]) {
            fileModule = parts[1].split('.')[0];
        }
    } else if (pkgName.includes('.firebase')) {
        fileModule = 'firebase';
    }

    const className = path.basename(filePath, '.java');

    // Check Controller
    if (content.includes('@RestController')) {
        const requestMappingMatch = content.match(/@RequestMapping\((?:"([^"]+)"|value\s*=\s*"([^"]+)")\)/);
        const basePath = requestMappingMatch ? (requestMappingMatch[1] || requestMappingMatch[2]) : '';
        
        // Find individual mappings
        const mappings = [];
        const lines = content.split('\n');
        let currentMapping = null;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const getPath = parseMappingAnnotation(line, 'GetMapping');
            const postPath = parseMappingAnnotation(line, 'PostMapping');
            const putPath = parseMappingAnnotation(line, 'PutMapping');
            const deletePath = parseMappingAnnotation(line, 'DeleteMapping');
            const patchPath = parseMappingAnnotation(line, 'PatchMapping');
            
            let method = null;
            let subPath = '';
            if (getPath !== null) { method = 'GET'; subPath = getPath; }
            else if (postPath !== null) { method = 'POST'; subPath = postPath; }
            else if (putPath !== null) { method = 'PUT'; subPath = putPath; }
            else if (deletePath !== null) { method = 'DELETE'; subPath = deletePath; }
            else if (patchPath !== null) { method = 'PATCH'; subPath = patchPath; }
            
            if (method) {
                // look for method name in next lines
                let methodName = '';
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const nextLine = lines[j];
                    const methodSignatureMatch = nextLine.match(/(?:public|private|protected)\s+[^\s]+\s+([a-zA-Z0-9_]+)\s*\(/);
                    if (methodSignatureMatch) {
                        methodName = methodSignatureMatch[1];
                        break;
                    }
                }
                
                const fullPath = (basePath + subPath).replace(/\/+/g, '/');
                mappings.push({ method, path: fullPath, methodName });
            }
        }
        
        analysis.controllers.push({
            className,
            module: fileModule,
            basePath,
            mappings
        });
    }

    // Check Entity
    if (content.includes('@Entity')) {
        const tableMatch = content.match(/@Table\(\s*name\s*=\s*"([^"]+)"\)/);
        const tableName = tableMatch ? tableMatch[1] : className.toLowerCase(); // approximation or default
        
        // Find relationships
        const relationships = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const manyToOne = line.includes('@ManyToOne');
            const oneToMany = line.includes('@OneToMany');
            const manyToMany = line.includes('@ManyToMany');
            const oneToOne = line.includes('@OneToOne');
            
            if (manyToOne || oneToMany || manyToMany || oneToOne) {
                let relType = manyToOne ? 'ManyToOne' : (oneToMany ? 'OneToMany' : (manyToMany ? 'ManyToMany' : 'OneToOne'));
                // look for target type and field in subsequent lines
                let fieldContent = '';
                for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine.startsWith('@ManyToOne') || nextLine.startsWith('@OneToMany') ||
                        nextLine.startsWith('@ManyToMany') || nextLine.startsWith('@OneToOne')) {
                        break;
                    }
                    const codeLine = nextLine.replace(/\/\/.*$/, '').trim();
                    if (codeLine && !codeLine.startsWith('@') && codeLine.endsWith(';')) {
                        fieldContent = codeLine;
                        break;
                    }
                }
                // extract type
                const fieldMatch = fieldContent.match(/(?:(?:private|protected|public)\s+)?([a-zA-Z0-9_<>\s?.]+)\s+([a-zA-Z0-9_]+);/);
                if (fieldMatch) {
                    const targetType = fieldMatch[1].trim();
                    const fieldName = fieldMatch[2].trim();
                    relationships.push({
                        type: relType,
                        targetType,
                        fieldName
                    });
                }
            }
        }
        
        analysis.entities.push({
            className,
            module: fileModule,
            tableName,
            relationships
        });
    }

    // Check Repository
    if (content.includes('interface ') && (content.includes('extends JpaRepository') || content.includes('@Repository'))) {
        analysis.repositories.push({
            className,
            module: fileModule
        });
    }

    // Check Service
    if (content.includes('@Service')) {
        analysis.services.push({
            className,
            module: fileModule
        });
    }

    // Check Cross-Module Dependencies in imports
    const importRegex = /import\s+org\.example\.QuanLyMuaVu\.module\.([^;]+);/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const targetPackage = match[1];
        const targetParts = targetPackage.split('.');
        const targetModule = targetParts[0];
        
        if (fileModule !== 'root' && targetModule !== fileModule) {
            // Find target class name from import
            const targetClass = targetParts[targetParts.length - 1];
            analysis.crossModuleDependencies.push({
                fromModule: fileModule,
                fromClass: className,
                toModule: targetModule,
                toClass: targetClass,
                type: targetParts.includes('entity') ? 'Entity' : (targetParts.includes('repository') ? 'Repository' : 'Other')
            });
        }
    }
});

// Output formatted results
console.log('--- SCANNING RESULTS ---');
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'SURVEY_RESULTS.md'), JSON.stringify(analysis, null, 2));
console.log('Wrote SURVEY_RESULTS.md');
