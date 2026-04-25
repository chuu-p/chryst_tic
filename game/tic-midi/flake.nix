{
  description = "TIC-MIDI: A MIDI-to-TIC-80 converter";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs";

  outputs = { self, nixpkgs }:
    let
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
      python = pkgs.python3.withPackages (ps: [ ps.mido ]);
      wrapper = pkgs.writeScriptBin "ticmidi" ''
        #!${pkgs.bash}/bin/bash
        exec ${python}/bin/python "${self}/tic_midi.py" "$@"
      '';
    in
    {
      packages.x86_64-linux.ticmidi = wrapper;

      apps.x86_64-linux.ticmidi = {
        type = "app";
        program = "${wrapper}/bin/ticmidi";
      };
    };
}