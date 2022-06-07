import { Command } from 'commander';

const program = new Command("generate");

program
  .description('Generate ABAP http client')
  .requiredOption('--openapi <openapi>', 'Path/URL to openApi schema')
  .option('--classname <class_name>', 'generated class name')
  .option('--interface <interface_name>', 'generated interface name')
  .option('--folder <folder>', 'Folder to store files to')
  .action((str, options: Command) => {

    const {openapi,interface_name, folder} : Record<string,string> = options.opts();

    //openapi && new OpenapiToABAP(openapi).generate({interface_name,folder});
    
  });


program.parseAsync(process.argv);