import Form from 'react-bootstrap/Form';

function UploadDependenciesForm({save}) {
    async function handleUpload(file) {
        const fileReader = new FileReader();
        fileReader.readAsText(file);
        fileReader.onloadend = () => {
            let file = JSON.parse(fileReader.result);
            let refs = [], dependencies = []; 
            for (const dep of file.dependencies) {
                dependencies.push(...dep.dependsOn);
            }
            for (const component of file.components) {
                if (dependencies.includes(component["bom-ref"])) {
                    if (refs.every(ref => ref.identifier !== component["bom-ref"])) {
                        refs.push({
                            name: component.name,
                            identifier: component["bom-ref"], 
                            type: component.type 
                        });
                    }
                }
            }
            save(refs);
        };
    }

    return (
        <Form>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Control size='sm' type="file" accept=".json" onChange={(e) => handleUpload(e.target.files[0])}/>
            </Form.Group>
        </Form>
    )
}
export default UploadDependenciesForm;