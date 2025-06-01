import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Table,
  Pagination,
} from 'react-bootstrap';
import { useAdvanceApprovalController } from '../controllers/AdvanceApprovalController';

const ITEMS_PER_PAGE = 5;

export default function AdvanceApprovalPage() {
  const { loading, allRequests, pendingRequests, updateStatus } =
    useAdvanceApprovalController();

  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  useEffect(() => {
    const sorted = [...allRequests].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setPaginatedData(sorted.slice(start, end));
  }, [allRequests, currentPage]);

  const totalPages = Math.ceil(allRequests.length / ITEMS_PER_PAGE);

  return (
    <Container fluid className="p-4">
      <Row>
        {/* Bekleyen Talepler */}
        <Col md={4} className="mb-4">
          <Card className="p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3">🕒 Bekleyen Talepler</h5>
            {loading ? (
              <Spinner animation="border" />
            ) : pendingRequests.length === 0 ? (
              <p className="text-muted">Bekleyen talep yok.</p>
            ) : (
              <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {[...pendingRequests]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map(item => (
                    <Card key={item.id} className="mb-3 p-3 border rounded-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>{item.employee.name}</h6>
                          <p className="mb-1">Tutar: ₺{item.amount}</p>
                          <p className="text-muted small mb-0">
                            Sebep: {item.reason}
                          </p>
                          <p className="text-muted small mb-0">
                            Tarih:{' '}
                            {new Date(item.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => updateStatus(item.id, true)}
                          >
                            Onayla
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => updateStatus(item.id, false)}
                          >
                            Reddet
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Tüm Talepler */}
        <Col md={8} className="mb-4">
          <Card className="p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3">📋 Tüm Talepler</h5>
            {loading ? (
              <Spinner animation="border" />
            ) : allRequests.length === 0 ? (
              <p className="text-muted">Tüm talepler boş.</p>
            ) : (
              <>
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Çalışan</th>
                      <th>Tutar</th>
                      <th>Sebep</th>
                      <th>Durum</th>
                      <th>Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map(item => (
                      <tr key={item.id}>
                        <td>{item.employee.name}</td>
                        <td>₺{item.amount}</td>
                        <td>{item.reason}</td>
                        <td>
                          <Badge
                            bg={
                              item.status === 'onaylandi'
                                ? 'success'
                                : item.status === 'reddedildi'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <p>{item.parsedDate.toLocaleDateString('tr-TR')}</p>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() =>
                          setCurrentPage(prev => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item
                          key={i}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() =>
                          setCurrentPage(prev => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
