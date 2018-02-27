// This file exports the rle object which has two functions:
//      rle.decode
//      rle.encode

// Run length encoded (RLE) form for a game of life pattern consists of
//   (1) a header with the number of rows, columns,
//       and the game rule (ex: x=23, y=24, rule=B2/S34),
//   (2) a run length encoded string where live cells are represented by an 'o',
//       dead cells by a 'b', row endings by '$', and the pattern end by '!'
//       (for example: '3bo$3b5o2$o!'). Unspecified ends in a given row are
//       assumed to be dead (for example, if x=5 in the header, the row '2bo$'
//       expands to 'bbobb')
//   and (3) any number of comment lines begining with '#'

// Decoding a RLE pattern will produce a gamestate of the dimensions specified in
// in the RLE pattern header.

const rle = (function() {
    
    function rle_to_row(rle) {
	//Given the rle data for a single row, produces the expanded row as an array 
	if (rle === '' || rle === '!')
	    return [];
	const regex = new RegExp(/(\d*[a-z])/, 'g');
	let groups = rle.match(regex);
	return flatmap(groups, from_rle_group);
    }
    
    function expand_rle(rle) {
	//replaces empty line encodings with a run of $'s
	//for example "2b3$o!" => "2b$$$o!"
	const regex = new RegExp(/(\d+)\$/, 'g');
	return rle.replace(regex, (m, p) => '$'.repeat(parseInt(p)));
    }
    
    function tdarr_from_rle(rle, row_len, pad_value=0) {
	//given a rle encoding a pattern and the row length of the pattern
	//returns a TDArray holding the pattern.
	
	//handle empty lines
	const rle_expanded = expand_rle(rle);
	const line_regex = new RegExp(/\w*(\$|\!)/, 'g');
	const rle_rows = rle_expanded.match(line_regex);
	const vals = rle_rows.map( rle_to_row );
	const full_rows = vals.map( (arr) => pad(arr, 0, row_len));
	return new TDArray(vals.length, row_len, (i,j) => full_rows[i][j]);
    }
    
    //rle headers are of the form "x = 12, y = 3, rule = B3/S23" with possible variable spacing
    function rle_header_rows(rle_header) {
	//extracts the numbers of rows (y value) from a rle header
	let regex = new RegExp(/y\s*=\s*(\d*)/);
	return parseInt(rle_header.match(regex)[1]);
    }
    
    function rle_header_cols(rle_header) {
	let regex = new RegExp(/x\s*=\s*(\d*)/);
	return parseInt(rle_header.match(regex)[1]);
    }

    function rle_header_rule(rle_header) {
	let regex = new RegExp(/[B,b]\d*\/[S,s]\d*/);
	let match = rle_header.match(regex);
	return new Rule(match[0]);
    }

    function from_rle(rle) {
	//returns an object of the form {rule : RULE, pattern :TDArray) from a rle
	//encoding a pattern. Ignores any comments lines
	let lines = rle.split('\n');
	lines = lines.filter( (l) => ! (l.match('^#')) );
	const header = lines[0];
	const rows = rle_header_rows(header);
	const cols = rle_header_cols(header);
	const rule = rle_header_rule(header);
	const tdarr = tdarr_from_rle(lines.slice(1).join(''), cols, 0);
	return {rule : rule, gamestate: new GameState(tdarr)};
    }
    
    
    function row_to_rle(row) {
	const unencoded = row.map( (v) => v === 0 ? 'b' : 'o' ).join('');
	const regex = new RegExp(/(.)\1+/, 'g');
	let encoded = unencoded.replace(regex, (m, p) =>
					String(m.length) + p);
	//remove any trailing 'b's and place '$' at the end of the string
	let ret = encoded.replace(/\d*b*$/, () => '$');
	return ret;
    }

    function from_rle_group(s) {
	//produces an array of values from a RLE codon
	//for example "3o" => [1, 1, 1,]
	//for example "b" => [0]
	const enc_map = {'o' : 1, 'b' : 0};
	let matches = s.match(/(\d*)([a-z])/);
	let val = enc_map[matches[2]];
	let num_str = matches[1];
    
	if (num_str  === '') {
	    return [val];
	}
	else {
	    let num = parseInt(num_str);
	    return new Array(num).fill(val);
	}
    }

     function reduce_to_pattern(tdarr) {
	//Given a TDArray, returns another TDArray with the same pattern of live cells
	//without any unecessary rows or columns of dead cells
	
	const is_one = (v) => v === 1;
	let i_0 = -1; //row of first non-zero entry with least i_index
	let j_0 = -1; //col of none-zero entry with least j_index
	let i_1 = -1; //row of last non-zero entry
	let j_1 = -1; //col of entry with greatest j_index
	
	for (r_index = 0; r_index < tdarr.rows; r_index++) {
            if (tdarr.row(r_index).some(is_one)) {
		i_0 = r_index;
		break;
            }
	}
	for (r_index = tdarr.rows - 1; r_index >= 0; r_index--) {
            if (tdarr.row(r_index).some(is_one)) {
		i_1 = r_index;
		break;
            }
	}
	for (c_index = 0; c_index < tdarr.cols; c_index++) {
            if (tdarr.col(c_index).some(is_one)) {
            j_0 = c_index;
		break;
            }
	}
	for (c_index = tdarr.cols - 1; c_index >= 0; c_index--) {
            if (tdarr.col(c_index).some(is_one)) {
		j_1 = c_index;
		break;
            }
	}
	return tdarr.rect(i_0, j_0, i_1, j_1);
    }
    
    function to_rle(tdarr, rule) {
	const header = ['x=', tdarr.cols, ', y=', tdarr.rows, ", rule = ", rule.string].join('');
	let pattern_rle =  tdarr.row_map( row_to_rle ).join('');
	//the pattern should end in !, the last $ isn't needed
	pattern_rle = pattern_rle.replace(/\$$/, '!');
	//group together runs of $
	let multi_endline_rg = new RegExp(/\$+/, 'g');
	pattern_rle = pattern_rle.replace(multi_endline_rg, (m) => String(m.length) + "$");
	//line lengths should be at most 70 characters
	const lines = [header].concat(chunk(pattern_rle, 70));
	return lines.join('\n');
    }

    return {
	encode : function(gamestate, rule=classic_rule, compress_b=true) {
	    // Encodes the given gamestate as a RLE pattern. COMPRESS_B determines whether
	    // the gamestate will be recorded in full (including unecessary rows/columns of cells)
	    // or if the gamestate will be reduced to only those cells relevant to the contained pattern
            if (compress_b)
		return to_rle(reduce_to_pattern(gamestate.cells), rule);
            else
		return to_rle(gamestate.cells, rule);
	},    
	decode : (r) => from_rle(r)
    };
}());
   
