This is a SASS/Compass project. Compass is configured with `config.rb`.

To compile the SASS into CSS:
 
1. Install Ruby. On windows, you'll need the Windows installer: [http://rubyinstaller.org/](http://rubyinstaller.org/)
2. Install SASS/Compass. On the command line, type `gem install compass`. (SASS is pulled in as a dependency for Compass.)
3. Navigate to this directory on the command line, and type `compass compile`. The CSS files will be generated in the
   top-level dist/css/ directory of the project.
 
The directory can also be watched for changes with `compass watch`, which will compile the CSS files each time a SASS (.scss) 
file is changed.