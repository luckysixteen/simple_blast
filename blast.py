import sys
import os
import subprocess

# sys.path.append(os.path.abspath("Users/Jen/Github/simple_blast/blast/"))
# from utils import *
# from .utils import create_query_fasta, extract_sequence


def blast_search(query_text: str):
    query_path = os.path.join(os.path.dirname(__file__) + '/../queries/test.fasta')
    # create_query_fasta(query_path, query_text)

    cmd_string = 'docker run --rm -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro -v $HOME/Github/simple_blast/queries:/blast/queries:ro ncbi/blast blastp -query /blast/queries/test.fasta -db ecoli -outfmt \"6 sstart send sstrand evalue pident\"'
    _, output = subprocess.getstatusoutput(cmd_string)

    # sstart, send, sstrand, evalue, pident
    output = output.split()


    return output

def get_res(arr):
    res = []
    possible = []
    i, j = 0, 0
    while i + j < len(arr):
        if j < 5:
            possible.append(arr[i + j])
            j += 1
        else:
            i, j = i + 5, 0
            res.append(possible)
            possible = []
    res.append(possible)
    return res


get_res([
    '7561', '7586', 'N/A', '1.90e-06', '100.000', '3162310', '3162330', 'N/A',
    '1.0', '76.190', '2694207', '2694231', 'N/A', '1.5', '72.000', '2713116',
    '2713130', 'N/A', '2.4', '86.667', '3087023', '3087042', 'N/A', '2.6',
    '75.000', '911530', '911549', 'N/A', '3.5', '80.000', '4136417', '4136431',
    'N/A', '4.3', '93.333', '905515', '905540', 'N/A', '4.4', '69.231',
    '1652460', '1652487', 'N/A', '4.5', '78.571', '2672429', '2672452', 'N/A',
    '5.0', '75.000', '34615', '34640', 'N/A', '5.3', '77.778', '1154931',
    '1154952', 'N/A', '5.5', '81.818', '3257457', '3257468', 'N/A', '5.8',
    '100.000'
])
# blast_search('CATATACCATGCCGGTCCGCCACGAA')