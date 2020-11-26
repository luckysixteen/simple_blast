# simple_blast

## Blast Set up
``` bash
# download ncbi/blast image
$ docker pull ncbi/blast

# run container
$ docker run --rm ncbi/blast \
> -v $HOME/genome:/genome:ro \
> 
```
```
docker run --rm -it\
    -v $HOME/Github/simple_blast/queries:/blast/queries:ro \
    -v $HOME/Github/simple_blast/genome:/blast/fasta:ro \
ncbi/blast /bin/bash

docker run --rm ncbi/blast \
    -v $HOME/Github/simple_blast/queries:/blast/queries:ro \
    -v $HOME/Github/simple_blast/genome:/blast/fasta:ro

docker run --rm 

blastp -query /queries/test.fasta -subject /fasta/ecoli_k12_mg1655.fasta -out /blastp.out
```

Make BLAST database 
```
docker run --rm \
    -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:rw \
    -v $HOME/Github/simple_blast/fasta:/blast/fasta:ro \
    -w /blast/blastdb_custom \
    ncbi/blast \
    makeblastdb -in /blast/fasta/ecoli_k12_mg1655.fasta -dbtype prot \
    -parse_seqids -out ecoli -title "ecoli" \
    -taxid 7801 -blastdb_version 0
```
```bash
Jens-MacBook:simple_blast Jen$ docker run --rm \
>     -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:rw \
>     -v $HOME/Github/simple_blast/fasta:/blast/fasta:ro \
>     -w /blast/blastdb_custom \
>     ncbi/blast \
>     makeblastdb -in /blast/fasta/ecoli_k12_mg1655.fasta -dbtype prot \
>     -parse_seqids -out ecoli -title "ecoli" \
>     -taxid 7801 -blastdb_version 5

Building a new DB, current time: 11/25/2020 23:43:20
New DB name:   /blast/blastdb_custom/ecoli
New DB title:  ecoli
Sequence type: Protein
Keep MBits: T
Maximum file size: 1000000000B
Adding sequences from FASTA; added 1 sequences in 0.162382 seconds.

```
Verify new database
```
docker run --rm \
    -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro \
    ncbi/blast \
    blastdbcmd -entry all -db ecoli -outfmt "%a %l %T"


Jens-MacBook:simple_blast Jen$ docker run --rm \
>     -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro \
>     ncbi/blast \
>     blastdbcmd -entry all -db ecoli -outfmt "%a %l %T"
U00096.3 4641652 7801
```

Run BLAST
```
docker run --rm \
    -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro \
    -v $HOME/Github/simple_blast/queries:/blast/queries:ro \
    -v $HOME/Github/simple_blast/results:/blast/results:rw \
    ncbi/blast \
    blastp -query /blast/queries/test1.fasta -db ecoli \
    -out /blast/results/blastp.txt

docker run --rm \
    -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro \
    -v $HOME/Github/simple_blast/queries:/blast/queries:ro \
    -v $HOME/Github/simple_blast/results:/blast/results:rw \
    ncbi/blast \
    blastp -query /blast/queries/test.fasta -db ecoli \
    -outfmt "6 sstart send evalue pident sstrand"


``` 
```
docker run --rm -v $HOME/Github/simple_blast/blastdb_custom:/blast/blastdb_custom:ro -v $HOME/Github/simple_blast/queries:/blast/queries:ro ncbi/blast blastp -query /blast/queries/test.fasta -db ecoli -outfmt "6 sstart send evalue pident sstrand"
```