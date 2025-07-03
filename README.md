1. Install VS Studio Community 2022 with the following:
	- Desktop Dev with C++
	- In individual Components:
		> MSVC v143 - VS 2022 C++ x64/x86 Spectre-mitigated libs (Latest)
		> MSVC v143 - VS 2022 C++ x64/x86 Spectre-mitigated libs (Latest)
		> C++ CMake tools for Windows
		> Windows 10 SDK (or Windows 11 SDK, version 10.0.22621.0 or later)
		> English language pack (critical for node-gyp)
2. Install Node version > 22.
3. Close all VSCodes, PS, or CMDs.
4. Open using Start: "x64 Native Tools Command Prompt for VS 2022"
5. Clean the cache:
	> rmdir /s /q node_modules
	> del package-lock.json
6. If VS Community is not installed in C: drive, then make a junction:
	> rmdir "C:\Program Files\Microsoft Visual Studio\2022"
	> mklink /J "C:\Program Files\Microsoft Visual Studio\2022" "E:\Program Files\Microsoft Visual Studio\2022 (path to Studio)"
7. [PATCH] Go to the "build/npm/preinstall.js", and make the following patch edits:
	- Find the block process.env['ProgramFiles(x86)'], and replace it with the following:
		>>
			const programFiles64Path = process.env['ProgramFiles'];
			const programFiles86Path = process.env['ProgramFiles(x86)'];
			const vsTypes = ['Enterprise', 'Professional', 'Community', 'Preview', 'BuildTools'];

			// Try 64-bit ProgramFiles first on 64-bit Windows
			if (programFiles64Path) {
  				let vsPath = path.join(programFiles64Path, 'Microsoft Visual Studio', version);
  				if (vsTypes.some(type => fs.existsSync(path.join(vsPath, type)))) {
    					availableVersions.push(version);
    					break;
  				}
			}

			// Then fall back to ProgramFiles(x86)
			if (programFiles86Path) {
  				let vsPath = path.join(programFiles86Path, 'Microsoft Visual Studio', version);
  				if (vsTypes.some(type => fs.existsSync(path.join(vsPath, type)))) {
    					availableVersions.push(version);
    					break;
  				}
			}
		<<
8. Reset the vsstudio variables: (It should only say C: drive, not E: since we have made the junction already)
	> set vs2022_install=
	> set vs2022_install=C:\Program Files (x86)\Microsoft Visual Studio\2022\Community
	> set vs2022_install=C:\Program Files\Microsoft Visual Studio\2022\Community
	> echo %vs2022_install% (and confirm path must include C:)
	> rmdir "C:\Program Files\Microsoft Visual Studio\2022"
	> mklink /J "C:\Program Files\Microsoft Visual Studio\2022" "E:\Program Files\Microsoft Visual Studio\2022 (path to your installation)"
9. Install the dependencies (make sure you have space ~40GB in the drive):
	! NO SPACES IN THE INSTALLATION PATH AS IT GIVES ERRORS.
	> npm install --msvs_version=2022
10. Then run the compilation:
	> npm run compile
	! If any error occurs due to build fails, path the lines (in this case path TypeErrors by accepting nulls, and then rerun compile.)
11. To run the software app (in the root folder):
	> .\scripts\code.bat
12. To run watcher, in a seperate Dev Shell, run:
	> npm run watch
	! IT TAKES A LOT OF RAM, SO USE CAREFULLY.
13. If for any reason the base product.json is changed, name changed or etc, rebuild gulp using:
	> npm run gulp vscode-win32-x64
