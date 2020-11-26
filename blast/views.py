from django.shortcuts import render
from django.http import HttpResponse
from django.http import QueryDict

from .models import BlastJob, BlastResult
from .forms import SearchForm
from .utils import *

import json
import os
import subprocess

# Create your views here.
def index(request):
    return render(request, 'index.html')

def search(request):
    if request.method == 'POST':
        query_text = request.POST.get('query')
        response_data = {}

        query = BlastJob(query=query_text)
        # query.save()

        print(query.query)

        raw_results = blast_search(query_text)
        for i in range(len(raw_results)):
            (sstart, send, sstrand, evalue, pident) = raw_results[i]
            seq = extract_sequence(int(sstart), int(send), sstrand)
            results = BlastResult(
                blast_job = query,
                sstart = int(sstart),
                send = int(send),
                sstrand = sstrand,
                evalue = float(evalue),
                pident = float(pident),
                sequence = seq
            )
            response_data[i] = {}
            response_data[i]['sstart'] = sstart
            response_data[i]['send'] = send
            response_data[i]['sstrand'] = sstrand
            response_data[i]['evalue'] = evalue
            response_data[i]['pident'] = pident
            response_data[i]['sequence'] = seq
            # results.save()
        response_data['length'] = len(raw_results)

        # response_data = {
        #     0: {
        #         'sstart':
        #         '7561',
        #         'send':
        #         '7770',
        #         'sstrand':
        #         'N/A',
        #         'evalue':
        #         '2.02e-79',
        #         'pident':
        #         '99.524',
        #         'sequence':
        #         'CATATACCATGCCGGTCCGCCACGAAACTGCCCATTGACGTCACGTTCTTTATAAAGTTGTGCCAGAGAACATTCGGCAAACGAGGTCGCCATGCCGATAAACGCGGCAACCCACATCCAAAAGACGGCTCCAGGTCCAC'
        #     },
        #     1: {
        #         'sstart':
        #         '7561',
        #         'send':
        #         '7770',
        #         'sstrand':
        #         'N/A',
        #         'evalue':
        #         '2.02e-79',
        #         'pident':
        #         '99.524',
        #         'sequence':
        #         'CATATACCATGCCGGTCCGCCACGAAACTGCCCATTGACGTCACGTTCTTTATAAAGTTGTGCCAGAGAACATTCGGCAAACGAGGTCGCCATGCCGATAAACGCGGCAACCCACATCCAAAAGACGGCTCCAGGTCCAC'
        #     },
        #     'length': 1
        # }
        return HttpResponse(
            json.dumps(response_data),
            content_type='application/json'
        )
    else:
        return HttpResponse(
            json.dumps({'error': 'error'}),
            content_type='application/json'
        )


def blast_search(query_text: str):
    query_path = os.path.join(
        os.path.dirname(__file__) + '/../queries/test.fasta')
    create_query_fasta(query_path, query_text)

    cmd_string = 'docker run --rm -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro -v $HOME/Github/simple_blast/queries:/blast/queries:ro ncbi/blast blastp -query /blast/queries/test.fasta -db ecoli -outfmt \"6 sstart send sstrand evalue pident\"'
    _, output = subprocess.getstatusoutput(cmd_string)

    # sstart, send, sstrand, evalue, pident
    output = output.split()
    res = []
    possible = []
    i, j = 0, 0
    while i + j < len(output):
        if j < 5:
            possible.append(output[i + j])
            j += 1
        else:
            i, j = i + 5, 0
            res.append(possible)
            possible = []
    res.append(possible)
    return res
