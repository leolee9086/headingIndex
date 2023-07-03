## Usage

After installing the plugin, a sequence number selection button will be added to the top bar. The icon is similar to the ordered list icon.

Left-click the button to upload the configuration file. Right-click in the secure context to open the configuration file upload menu.

## Configuration file format

The configuration file name is the option name displayed in the menu.

### Global configuration file

The configuration file selected in the menu will be used as the default title numbering style.
When this style fails to apply, an error will be displayed in the menu.

### Document configuration file

The document configuration file is determined by the document's custom-index-scheme.

### Configuration item writing

Taking js configuration as an example (json writing is similar)
```js
[ 
    "Part {h1.en}" 
   , 
    "Section {h2.en}"  
   , 
    "{h3.roman}"
   ,
    "({h4.ABC}):"  
   , 
    "{h5.abc}" 
   ,
   "{h6}"  
]
```

Items in brackets {} will be replaced by title numbering variables.

h1 renders first-level title numbering.

h2 renders second-level title numbering, and so on.

Do not nest brackets.

Some simple formatting functions are provided by default:

h1.ch indicates the Chinese digital lowercase form of the first-level title number;

h1.en indicates the English word form of the first-level title number; 

h1.roman indicates the Roman numeral form of the first-level title number.

h1.ABC for uppercase .

h1.ABC for lowercase .

So on and so forth. 

The numbering only considers the title.

The plugin folder comes with four setting examples. You can try to refer to them and modify your own preferred styles.

### write index

use 'write index' in edtiortitleicon menu you can write index to those heading blocks in document
### 忽略文档

document with attribute custom-index-scheme:null  will be ignored

## long blocks

Long document blocks (over 1024 documents) will not generate numbering automatically and need to be manually generated in the editor menu.