from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from django.http import QueryDict

from .models import BlastJob, BlastResult
from .forms import SearchForm
from .utils import *

import json
import os
import subprocess
import after_response


def index(request):
    return render(request, 'index.html')


@csrf_exempt
def search(request):
    if request.method == 'POST':
        query_text = json.loads(request.body.decode("utf-8"))['query']
        query = BlastJob(query=query_text, status='pending')
        query.save()
        call_docker_blast.after_response(query)
        # query.id = 9
        response_data = {'status': 'success',
                         'data': query.id}

        return HttpResponse(json.dumps(response_data),
                            content_type='application/json')

def result(request, blast_id):
    try:
        blast = BlastJob.objects.get(pk=blast_id)
        if blast.status == 'pending':
            return HttpResponse(json.dumps({'status': 'pending'}),
                                content_type='application/json')
        else:

            result = blast.blastresult_set.get()
            response_data = {}
            response_data['status'] = 'done'
            response_data['sstart'] = result.sstart
            response_data['send'] = result.send
            response_data['sstrand'] = result.sstrand
            response_data['evalue'] = result.evalue
            response_data['pident'] = result.pident
            response_data['sequence'] = result.sequence
            response_data['query'] = blast.query

            return HttpResponse(json.dumps(response_data),
                                content_type='application/json')

    except BlastJob.DoesNotExist:
        return HttpResponse(json.dumps({}),
                            content_type='application/json')


@after_response.enable
def call_docker_blast(query):
    print('starting calling docker...')
    raw_results = blast_search(query.query)
    if not raw_results:
        results = BlastResult(blast_job=query, result_no = query.id , sstart = 0, send = 0, sstrand = '', evalue = 0, pident = 0, sequence = '')
    else:
        (sstart, send, sstrand, evalue, pident) = raw_results
        seq = extract_sequence(int(sstart), int(send), sstrand)
        results = BlastResult(blast_job=query,
                              result_no=query.id,
                              sstart=int(sstart),
                              send=int(send),
                              sstrand=sstrand,
                              evalue=float(evalue),
                              pident=float(pident),
                              sequence=seq)
    query.status = 'done'
    query.save()
    results.save()

def blast_search(query_text: str):
    query_path = os.path.join(
        os.path.dirname(__file__) + '/../queries/test.fasta')
    create_query_fasta(query_path, query_text)

    cmd_string = 'docker run --rm -v $HOME/Github/simple_blast/fasta:/blast/fasta:ro -v $HOME/Github/simple_blast/queries:/blast/queries:ro ncbi/blast blastn -query /blast/queries/test.fasta -subject /blast/fasta/ecoli_k12_mg1655.fasta -outfmt \"6 sstart send sstrand evalue pident\"'
    _, output = subprocess.getstatusoutput(cmd_string)

    # sstart, send, sstrand, evalue, pident
    output = output.split()
    return output
    # if not output: return output
    # res = []
    # possible = []
    # i, j = 0, 0
    # while i + j < len(output):
    #     if j < 5:
    #         possible.append(output[i + j])
    #         j += 1
    #     else:
    #         i, j = i + 5, 0
    #         res.append(possible)
    #         possible = []
    # res.append(possible)
    # return res
