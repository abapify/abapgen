import { Command } from 'commander';
import { OpenapiToABAP } from '@abapify/abapgen-openapi';
import { abapgen as stringify } from '@abapify/abapgen';
import { writeFile, mkdir } from 'node:fs/promises';
import * as path from "path";

export const generate = new Command("generate");

generate
  .description('Generate ABAP http client')
  .requiredOption('--openapi <openapi>', 'Path/URL to openApi schema')
  .option('--classname <class_name>', 'generated class name')
  .option('--interface, --interface-name <interface_name>', 'generated interface name')
  .option('--folder <folder>', 'Folder to store files to')
  .action( async (str, options: Command) =>  {

    const {openapi, interfaceName, folder} : Record<string,string> = options.opts();

    const openapiGen = await OpenapiToABAP.load(openapi);

    openapiGen.parse({operations:["getPetById"]});

    const interface_model = openapiGen.get_interface(interfaceName);
    const interface_code = stringify( interface_model );
    const folder_path = path.resolve(process.cwd(), folder );

    await mkdir(folder_path,{recursive:true});    
    await writeFile(`${folder_path}/${interfaceName}.intf.abap`, interface_code);
    
  });
